package handler

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"chess-backend/internal/service"
)

type TacticsHandler struct {
	aiSvc    *service.AIService
	cacheSvc *service.CacheService
}

func NewTacticsHandler(aiSvc *service.AIService, cacheSvc *service.CacheService) *TacticsHandler {
	return &TacticsHandler{aiSvc: aiSvc, cacheSvc: cacheSvc}
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

	var redisKey string
	if h.cacheSvc.IsEnabled() {
		hasher := sha256.New()
		hasher.Write([]byte(req.Fen))
		fenHash := fmt.Sprintf("%x", hasher.Sum(nil))
		redisKey = fmt.Sprintf("tactics:%s:%s:%s", fenHash, req.PlayedMove, req.BestMove)

		if val, err := h.cacheSvc.Get(redisKey); err == nil {
			var cachedRes service.TacticsResponse
			if json.Unmarshal([]byte(val), &cachedRes) == nil {
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(cachedRes)
				return
			}
		}
	}

	res, err := h.aiSvc.AnalyzeTactics(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if h.cacheSvc.IsEnabled() && redisKey != "" {
		if serialized, err := json.Marshal(res); err == nil {
			_ = h.cacheSvc.Set(redisKey, string(serialized), 24*time.Hour)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(res); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}
