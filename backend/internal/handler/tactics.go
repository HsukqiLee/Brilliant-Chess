package handler

import (
	"encoding/json"
	"net/http"

	"chess-backend/internal/service"
)

type TacticsHandler struct {
	geminiSvc *service.GeminiService
}

func NewTacticsHandler(geminiSvc *service.GeminiService) *TacticsHandler {
	return &TacticsHandler{geminiSvc: geminiSvc}
}

func (h *TacticsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req service.TacticsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	res, err := h.geminiSvc.AnalyzeTactics(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(res); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}
