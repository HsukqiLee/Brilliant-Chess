package main

import (
	"log"
	"net/http"

	"chess-backend/internal/config"
	"chess-backend/internal/handler"
	"chess-backend/internal/middleware"
	"chess-backend/internal/service"
)

func main() {
	cfg := config.Load()

	aiSvc := service.NewAIService(cfg.AIFormat, cfg.AIAPIKey, cfg.AIEndpoint, cfg.AIModel)

	evalHandler := handler.NewEvaluateHandler(cfg)
	commentaryHandler := handler.NewCommentaryHandler(aiSvc)
	modelsHandler := handler.NewModelsHandler(cfg)
	tacticsHandler := handler.NewTacticsHandler(aiSvc)

	mux := http.NewServeMux()
	mux.HandleFunc("/health", handler.Health)
	mux.Handle("/api/models", modelsHandler)
	mux.Handle("/api/ws/evaluate", evalHandler)
	mux.Handle("/api/ai/commentary", commentaryHandler)
	mux.Handle("/api/ai/tactics", tacticsHandler)

	log.Printf("Starting API server on port %s...", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, middleware.Cors(mux)); err != nil {
		log.Fatalf("API server failed: %v", err)
	}
}
