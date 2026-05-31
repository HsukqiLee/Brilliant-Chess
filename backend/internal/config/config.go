package config

import "os"

type ModelConfig struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Port string `json:"-"`
}

type Config struct {
	Port          string
	StockfishHost string
	GeminiAPIKey  string
	DefaultModel  string
	Models        []ModelConfig
	AIFormat      string
	AIAPIKey      string
	AIEndpoint    string
	AIModel       string
	DBType        string
	DBDSN         string
	JWTSecret     string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	stockfishHost := os.Getenv("STOCKFISH_HOST")
	if stockfishHost == "" {
		stockfishHost = "stockfish"
	}
	geminiAPIKey := os.Getenv("GEMINI_API_KEY")

	defaultModel := os.Getenv("DEFAULT_MODEL")
	if defaultModel == "" {
		defaultModel = "sf18"
	}

	sf18Port := os.Getenv("STOCKFISH_PORT_SF18")
	if sf18Port == "" {
		sf18Port = "3333"
	}
	sf17Port := os.Getenv("STOCKFISH_PORT_SF17")
	if sf17Port == "" {
		sf17Port = "3334"
	}
	sf16Port := os.Getenv("STOCKFISH_PORT_SF16")
	if sf16Port == "" {
		sf16Port = "3335"
	}

	models := []ModelConfig{
		{ID: "sf18", Name: "Stockfish 18 (Latest/Large)", Port: sf18Port},
		{ID: "sf17", Name: "Stockfish 17 (Medium)", Port: sf17Port},
		{ID: "sf16", Name: "Stockfish 16 (Small)", Port: sf16Port},
	}

	aiFormat := os.Getenv("AI_FORMAT")
	if aiFormat == "" {
		aiFormat = "gemini"
	}
	aiAPIKey := os.Getenv("AI_API_KEY")
	if aiAPIKey == "" {
		aiAPIKey = geminiAPIKey
	}
	aiEndpoint := os.Getenv("AI_ENDPOINT")
	aiModel := os.Getenv("AI_MODEL")
	if aiModel == "" {
		if aiFormat == "gemini" {
			aiModel = "gemini-2.5-flash"
		} else if aiFormat == "openai" {
			aiModel = "gpt-4o-mini"
		} else if aiFormat == "anthropic" {
			aiModel = "claude-3-5-sonnet-20241022"
		}
	}

	dbType := os.Getenv("DB_TYPE")
	if dbType == "" {
		dbType = "sqlite"
	}
	dbDSN := os.Getenv("DB_DSN")
	if dbDSN == "" {
		dbDSN = "data/chess.db"
	}
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "brilliant-chess-secret-key-123"
	}

	return &Config{
		Port:          port,
		StockfishHost: stockfishHost,
		GeminiAPIKey:  geminiAPIKey,
		DefaultModel:  defaultModel,
		Models:        models,
		AIFormat:      aiFormat,
		AIAPIKey:      aiAPIKey,
		AIEndpoint:    aiEndpoint,
		AIModel:       aiModel,
		DBType:        dbType,
		DBDSN:         dbDSN,
		JWTSecret:     jwtSecret,
	}
}
