package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"chess-backend/internal/service"
)

type PlayHandler struct {
	aiSvc *service.AIService
}

func NewPlayHandler(aiSvc *service.AIService) *PlayHandler {
	return &PlayHandler{aiSvc: aiSvc}
}

type PlayRequest struct {
	Fen         string   `json:"fen"`
	LegalMoves  []string `json:"legalMoves"`
	Personality string   `json:"personality"`
}

type PlayResponse struct {
	Move    string `json:"move"`
	Comment string `json:"comment"`
}

func (h *PlayHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req PlayRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Fen == "" || len(req.LegalMoves) == 0 {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	personality := req.Personality
	if personality == "" {
		personality = "The Chatty Coach"
	}

	responseRaw, err := h.aiSvc.PlayMove(req.Fen, req.LegalMoves, personality)
	if err != nil {
		// Fallback to first legal move if AI service fails
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(PlayResponse{
			Move:    req.LegalMoves[0],
			Comment: "I'll make this standard move for now.",
		})
		return
	}

	// Clean up LLM code blocks if any
	cleaned := strings.TrimPrefix(responseRaw, "```json")
	cleaned = strings.TrimPrefix(cleaned, "```")
	cleaned = strings.TrimSuffix(cleaned, "```")
	cleaned = strings.TrimSpace(cleaned)

	var playResp PlayResponse
	if err := json.Unmarshal([]byte(cleaned), &playResp); err != nil {
		// Fallback if parsing fails
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(PlayResponse{
			Move:    req.LegalMoves[0],
			Comment: "Let's proceed with this move.",
		})
		return
	}

	// Validate chosen move exists in legal moves list
	isValid := false
	for _, m := range req.LegalMoves {
		if strings.ToLower(m) == strings.ToLower(playResp.Move) {
			playResp.Move = m // Normalise casing
			isValid = true
			break
		}
	}

	if !isValid {
		// Fallback if the AI chose an illegal move
		playResp.Move = req.LegalMoves[0]
		playResp.Comment = "Making a solid, classic move."
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(playResp)
}
