package handler

import (
	"bufio"
	"io"
	"log"
	"net/http"
	"strings"
	"sync/atomic"
	"time"

	"chess-backend/internal/config"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type EvaluateHandler struct {
	cfg  *config.Config
	pool *StockfishPool
}

func NewEvaluateHandler(cfg *config.Config, pool *StockfishPool) *EvaluateHandler {
	return &EvaluateHandler{
		cfg:  cfg,
		pool: pool,
	}
}

func (h *EvaluateHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	modelID := r.URL.Query().Get("model")
	if modelID == "" {
		modelID = h.cfg.DefaultModel
	}

	// Validate model before upgrading WS
	var modelValid bool
	for _, m := range h.cfg.Models {
		if m.ID == modelID {
			modelValid = true
			break
		}
	}
	if !modelValid {
		http.Error(w, "Invalid model: "+modelID, http.StatusBadRequest)
		return
	}

	wsConn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade websocket: %v", err)
		return
	}
	defer wsConn.Close()

	// Acquire a connection from the pool
	tcpConn, err := h.pool.Get(modelID)
	if err != nil {
		log.Printf("Failed to lease Stockfish connection from pool: %v", err)
		return
	}

	// Flag to track if TCP had an error and should be discarded rather than recycled
	var tcpErrOccurred int32

	// Done channels to coordinate exit of both loops
	sessionDone := make(chan struct{})
	tcpDone := make(chan struct{})

	// WS -> TCP forwarding loop
	go func() {
		defer close(sessionDone)
		for {
			_, msg, err := wsConn.ReadMessage()
			if err != nil {
				// Client disconnected
				return
			}
			cmd := string(msg)
			if !strings.HasSuffix(cmd, "\n") {
				cmd += "\n"
			}
			// Write to engine with write deadline to prevent blocking forever if TCP is wedged
			tcpConn.SetWriteDeadline(time.Now().Add(5 * time.Second))
			_, err = tcpConn.Write([]byte(cmd))
			tcpConn.SetWriteDeadline(time.Time{})
			if err != nil {
				atomic.StoreInt32(&tcpErrOccurred, 1)
				return
			}
		}
	}()

	// TCP -> WS forwarding loop
	go func() {
		defer close(tcpDone)
		reader := bufio.NewReader(tcpConn)
		for {
			line, err := reader.ReadString('\n')
			if err != nil {
				// Handle reading interruption from timeout or real error
				if !strings.Contains(err.Error(), "i/o timeout") && err != io.EOF {
					log.Printf("Error reading from Stockfish TCP: %v", err)
				}
				atomic.StoreInt32(&tcpErrOccurred, 1)
				return
			}
			trimmed := strings.TrimSpace(line)
			err = wsConn.WriteMessage(websocket.TextMessage, []byte(trimmed))
			if err != nil {
				return
			}
		}
	}()

	// Wait until either the user closes the socket (sessionDone) or a TCP socket error occurs (tcpDone)
	select {
	case <-sessionDone:
	case <-tcpDone:
	}

	// Force TCP reader to unblock by setting deadline to past
	tcpConn.SetReadDeadline(time.Unix(1, 0))

	// Wait for both goroutines to exit completely to prevent concurrent read race on the socket
	<-tcpDone
	<-sessionDone

	// Reset deadlines
	tcpConn.SetReadDeadline(time.Time{})
	tcpConn.SetWriteDeadline(time.Time{})

	// Recycle or close the connection based on whether errors occurred
	if atomic.LoadInt32(&tcpErrOccurred) == 1 {
		tcpConn.Close()
		log.Printf("Stockfish connection closed and discarded due to errors")
	} else {
		h.pool.Put(modelID, tcpConn)
	}
}
