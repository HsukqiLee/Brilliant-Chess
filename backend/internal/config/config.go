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

	return &Config{
		Port:          port,
		StockfishHost: stockfishHost,
		GeminiAPIKey:  geminiAPIKey,
		DefaultModel:  defaultModel,
		Models:        models,
	}
}

