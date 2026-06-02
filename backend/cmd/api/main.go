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
	if cfg.JWTSecret == "" {
		log.Fatal("JWT_SECRET must be set")
	}

	dbSvc, err := service.NewDBService(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer dbSvc.Close()

	aiSvc := service.NewAIService(cfg.AIFormat, cfg.AIAPIKey, cfg.AIEndpoint, cfg.AIModel)
	cacheSvc := service.NewCacheService(cfg.RedisAddr, cfg.RedisPassword)

	stockfishPool := handler.NewStockfishPool(cfg, 5)
	defer stockfishPool.Close()

	evalHandler := handler.NewEvaluateHandler(cfg, stockfishPool)
	commentaryHandler := handler.NewCommentaryHandler(aiSvc, cacheSvc)
	modelsHandler := handler.NewModelsHandler(cfg)
	tacticsHandler := handler.NewTacticsHandler(aiSvc, cacheSvc)
	libraryHandler := handler.NewLibraryHandler(dbSvc)
	authHandler := handler.NewAuthHandler(dbSvc, cfg.JWTSecret)
	playHandler := handler.NewPlayHandler(aiSvc, cacheSvc)

	authMiddleware := middleware.NewAuthMiddleware(cfg.JWTSecret)

	mux := http.NewServeMux()
	mux.HandleFunc("/health", handler.Health)
	mux.Handle("/api/models", modelsHandler)
	mux.Handle("/api/ws/evaluate", evalHandler)
	mux.Handle("/api/ai/commentary", commentaryHandler)
	mux.Handle("/api/ai/tactics", tacticsHandler)
	mux.Handle("/api/ai/play", playHandler)

	// Auth routes
	mux.HandleFunc("/api/auth/register", authHandler.Register)
	mux.HandleFunc("/api/auth/login", authHandler.Login)
	mux.HandleFunc("/api/auth/logout", authHandler.Logout)
	mux.Handle("/api/auth/me", authMiddleware.Handler(http.HandlerFunc(authHandler.Me)))

	// Protected Library routes
	mux.Handle("/api/games", authMiddleware.Handler(middleware.RequireAuth(libraryHandler)))
	mux.Handle("/api/games/", authMiddleware.Handler(middleware.RequireAuth(libraryHandler)))
	mux.Handle("/api/stats", authMiddleware.Handler(middleware.RequireAuth(libraryHandler)))

	log.Printf("Starting API server on port %s...", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, middleware.Cors(mux, cfg.CorsOrigins)); err != nil {
		log.Fatalf("API server failed: %v", err)
	}
}
