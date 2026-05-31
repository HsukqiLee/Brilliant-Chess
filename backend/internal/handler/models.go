package handler

import (
	"encoding/json"
	"net/http"

	"chess-backend/internal/config"
)

type ModelsHandler struct {
	cfg *config.Config
}

func NewModelsHandler(cfg *config.Config) *ModelsHandler {
	return &ModelsHandler{cfg: cfg}
}

type ModelsResponse struct {
	Models  []config.ModelConfig `json:"models"`
	Default string               `json:"default"`
}

func (h *ModelsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	resp := ModelsResponse{
		Models:  h.cfg.Models,
		Default: h.cfg.DefaultModel,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
