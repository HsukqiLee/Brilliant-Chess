package handler

import (
	"encoding/json"
	"net/http"

	"chess-backend/internal/service"
)

type CommentaryHandler struct {
	geminiSvc *service.GeminiService
}

func NewCommentaryHandler(geminiSvc *service.GeminiService) *CommentaryHandler {
	return &CommentaryHandler{geminiSvc: geminiSvc}
}

func (h *CommentaryHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req service.CommentaryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	commentary, err := h.geminiSvc.GenerateCommentary(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"commentary": commentary,
	})
}
