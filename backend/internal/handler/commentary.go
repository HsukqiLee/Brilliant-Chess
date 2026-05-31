package handler

import (
	"encoding/json"
	"net/http"

	"chess-backend/internal/service"
)

type CommentaryHandler struct {
	aiSvc *service.AIService
}

func NewCommentaryHandler(aiSvc *service.AIService) *CommentaryHandler {
	return &CommentaryHandler{aiSvc: aiSvc}
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

	commentary, err := h.aiSvc.GenerateCommentary(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"commentary": commentary,
	})
}
