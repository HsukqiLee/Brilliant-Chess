package handler

import (
	"bufio"
	"io"
	"log"
	"net"
	"net/http"
	"strings"

	"chess-backend/internal/config"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type EvaluateHandler struct {
	cfg *config.Config
}

func NewEvaluateHandler(cfg *config.Config) *EvaluateHandler {
	return &EvaluateHandler{cfg: cfg}
}

func (h *EvaluateHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	modelID := r.URL.Query().Get("model")
	if modelID == "" {
		modelID = h.cfg.DefaultModel
	}

	var targetPort string
	for _, m := range h.cfg.Models {
		if m.ID == modelID {
			targetPort = m.Port
			break
		}
	}

	if targetPort == "" {
		http.Error(w, "Invalid model: "+modelID, http.StatusBadRequest)
		return
	}

	wsConn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade websocket: %v", err)
		return
	}
	defer wsConn.Close()

	addr := h.cfg.StockfishHost + ":" + targetPort
	log.Printf("Connecting to Stockfish (%s) at %s...", modelID, addr)
	tcpConn, err := net.Dial("tcp", addr)
	if err != nil {
		log.Printf("Failed to connect to Stockfish: %v", err)
		return
	}
	defer tcpConn.Close()

	// WS -> TCP
	go func() {
		for {
			_, msg, err := wsConn.ReadMessage()
			if err != nil {
				tcpConn.Close()
				return
			}
			cmd := string(msg)
			if !strings.HasSuffix(cmd, "\n") {
				cmd += "\n"
			}
			_, err = tcpConn.Write([]byte(cmd))
			if err != nil {
				wsConn.Close()
				return
			}
		}
	}()

	// TCP -> WS
	reader := bufio.NewReader(tcpConn)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if err != io.EOF {
				log.Printf("Error reading from Stockfish TCP: %v", err)
			}
			break
		}
		trimmed := strings.TrimSpace(line)
		err = wsConn.WriteMessage(websocket.TextMessage, []byte(trimmed))
		if err != nil {
			log.Printf("Failed to write to WS: %v", err)
			break
		}
	}
}
