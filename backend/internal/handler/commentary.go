package handler

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"chess-backend/internal/service"
)

type CommentaryHandler struct {
	aiSvc    *service.AIService
	cacheSvc *service.CacheService
}

func NewCommentaryHandler(aiSvc *service.AIService, cacheSvc *service.CacheService) *CommentaryHandler {
	return &CommentaryHandler{aiSvc: aiSvc, cacheSvc: cacheSvc}
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

	var redisKey string
	if h.cacheSvc.IsEnabled() {
		hasher := sha256.New()
		hasher.Write([]byte(req.Fen))
		fenHash := fmt.Sprintf("%x", hasher.Sum(nil))
		redisKey = fmt.Sprintf("commentary:%s:%s:%s", fenHash, req.Move, req.BestMove)

		if val, err := h.cacheSvc.Get(redisKey); err == nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{
				"commentary": val,
			})
			return
		}
	}

	commentary, err := h.aiSvc.GenerateCommentary(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if h.cacheSvc.IsEnabled() && redisKey != "" {
		_ = h.cacheSvc.Set(redisKey, commentary, 24*time.Hour)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"commentary": commentary,
	})
}
