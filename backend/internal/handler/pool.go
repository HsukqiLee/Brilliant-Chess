package handler

import (
	"bufio"
	"chess-backend/internal/config"
	"fmt"
	"io"
	"log"
	"net"
	"sync"
	"time"
)

type StockfishPool struct {
	cfg      *config.Config
	mu       sync.Mutex
	conns    map[string][]net.Conn
	maxConns int // max idle connections per model
}

func NewStockfishPool(cfg *config.Config, maxIdle int) *StockfishPool {
	return &StockfishPool{
		cfg:      cfg,
		conns:    make(map[string][]net.Conn),
		maxConns: maxIdle,
	}
}

// Get leases a connection from the pool or dials a new one if the pool is empty
func (p *StockfishPool) Get(modelID string) (net.Conn, error) {
	p.mu.Lock()
	conns, ok := p.conns[modelID]
	if ok && len(conns) > 0 {
		// Pop the last connection (LIFO)
		conn := conns[len(conns)-1]
		p.conns[modelID] = conns[:len(conns)-1]
		p.mu.Unlock()

		// Validate that the pooled connection is still active and working
		if p.validateConn(conn) {
			log.Printf("StockfishPool: Leased warm connection for model %s", modelID)
			return conn, nil
		}
		log.Printf("StockfishPool: Discarding dead pooled connection for model %s", modelID)
		conn.Close()

		// Try to get another pooled connection
		return p.Get(modelID)
	}
	p.mu.Unlock()

	// No warm connections available, dial a new one
	log.Printf("StockfishPool: Pool empty for model %s. Dialing a new connection...", modelID)
	return p.dialNew(modelID)
}

// Put returns a healthy connection to the pool or closes it if the pool is full
func (p *StockfishPool) Put(modelID string, conn net.Conn) {
	// Reset the connection state back to a clean UCI game state
	if !p.resetConn(conn) {
		log.Printf("StockfishPool: Failed to reset connection for model %s. Closing.", modelID)
		conn.Close()
		return
	}

	p.mu.Lock()
	defer p.mu.Unlock()

	conns := p.conns[modelID]
	if len(conns) < p.maxConns {
		p.conns[modelID] = append(conns, conn)
		log.Printf("StockfishPool: Connection returned to pool for model %s (pool size: %d/%d)", modelID, len(p.conns[modelID]), p.maxConns)
	} else {
		log.Printf("StockfishPool: Pool full for model %s. Closing connection.", modelID)
		conn.Close()
	}
}

// Close closes all pooled connections on server shutdown
func (p *StockfishPool) Close() {
	p.mu.Lock()
	defer p.mu.Unlock()

	log.Printf("StockfishPool: Shutting down and closing all pooled connections")
	for modelID, conns := range p.conns {
		for _, conn := range conns {
			conn.Close()
		}
		delete(p.conns, modelID)
	}
}

// dialNew connects to a Stockfish engine instance and waits for initial readiness
func (p *StockfishPool) dialNew(modelID string) (net.Conn, error) {
	var targetPort string
	for _, m := range p.cfg.Models {
		if m.ID == modelID {
			targetPort = m.Port
			break
		}
	}
	if targetPort == "" {
		return nil, fmt.Errorf("invalid model: %s", modelID)
	}

	addr := p.cfg.StockfishHost + ":" + targetPort
	conn, err := net.DialTimeout("tcp", addr, 5*time.Second)
	if err != nil {
		return nil, err
	}

	// Verify that the engine starts up and accepts commands
	if !p.validateConn(conn) {
		conn.Close()
		return nil, fmt.Errorf("failed to validate newly dialed connection for model %s", modelID)
	}

	return conn, nil
}

// validateConn does a quick isready check to verify the connection is healthy
func (p *StockfishPool) validateConn(conn net.Conn) bool {
	conn.SetDeadline(time.Now().Add(10 * time.Second))
	defer conn.SetDeadline(time.Time{})

	_, err := conn.Write([]byte("isready\n"))
	if err != nil {
		return false
	}

	reader := bufio.NewReader(conn)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			return false
		}
		if line == "readyok\n" || line == "readyok\r\n" {
			return true
		}
	}
}

// resetConn stops searches and resets the game state
func (p *StockfishPool) resetConn(conn net.Conn) bool {
	conn.SetDeadline(time.Now().Add(10 * time.Second))
	defer conn.SetDeadline(time.Time{})

	// stop any active calculations, trigger ucinewgame, and check readiness
	_, err := conn.Write([]byte("stop\nucinewgame\nisready\n"))
	if err != nil {
		return false
	}

	reader := bufio.NewReader(conn)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			// If it's EOF or error, connection is dead
			if err != io.EOF {
				log.Printf("StockfishPool error during reset: %v", err)
			}
			return false
		}
		if line == "readyok\n" || line == "readyok\r\n" {
			return true
		}
	}
}
