package service

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"chess-backend/internal/config"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	_ "modernc.org/sqlite"
)

type DBService struct {
	DB     *sql.DB
	DBType string
}

func NewDBService(cfg *config.Config) (*DBService, error) {
	dbType := strings.ToLower(cfg.DBType)
	dsn := cfg.DBDSN

	var driverName string
	var connectionString string

	switch dbType {
	case "mysql":
		driverName = "mysql"
		connectionString = dsn
	case "postgres", "pgsql":
		driverName = "postgres"
		connectionString = dsn
	case "sqlite":
		driverName = "sqlite"
		connectionString = dsn
		// Create the parent directory for SQLite files if it doesn't exist
		dir := filepath.Dir(dsn)
		if dir != "." && dir != "/" {
			if err := os.MkdirAll(dir, 0755); err != nil {
				return nil, fmt.Errorf("failed to create sqlite database directory: %w", err)
			}
		}
	default:
		return nil, fmt.Errorf("unsupported database type: %s", dbType)
	}

	db, err := sql.Open(driverName, connectionString)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %w", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	svc := &DBService{
		DB:     db,
		DBType: dbType,
	}

	if err := svc.initSchema(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to initialize schema: %w", err)
	}

	return svc, nil
}

func (s *DBService) Close() error {
	return s.DB.Close()
}

// Rebind translates standard SQL '?' placeholders into PostgreSQL '$1, $2' format if needed.
func (s *DBService) Rebind(query string) string {
	if s.DBType != "postgres" && s.DBType != "pgsql" {
		return query
	}

	var result strings.Builder
	paramIndex := 1
	for _, r := range query {
		if r == '?' {
			result.WriteString(fmt.Sprintf("$%d", paramIndex))
			paramIndex++
		} else {
			result.WriteRune(r)
		}
	}
	return result.String()
}

func (s *DBService) initSchema() error {
	var usersSchema string
	var gamesSchema string

	switch s.DBType {
	case "postgres", "pgsql":
		usersSchema = `
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			username VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`
		gamesSchema = `
		CREATE TABLE IF NOT EXISTS games (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id),
			event TEXT,
			date TEXT,
			result TEXT,
			white_name TEXT,
			black_name TEXT,
			white_elo INTEGER,
			black_elo INTEGER,
			white_accuracy DOUBLE PRECISION,
			black_accuracy DOUBLE PRECISION,
			white_cpl DOUBLE PRECISION,
			black_cpl DOUBLE PRECISION,
			pgn TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`
	case "mysql":
		usersSchema = `
		CREATE TABLE IF NOT EXISTS users (
			id INT AUTO_INCREMENT PRIMARY KEY,
			username VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
		gamesSchema = `
		CREATE TABLE IF NOT EXISTS games (
			id INT AUTO_INCREMENT PRIMARY KEY,
			user_id INT,
			event VARCHAR(255),
			date VARCHAR(255),
			result VARCHAR(50),
			white_name VARCHAR(255),
			black_name VARCHAR(255),
			white_elo INT,
			black_elo INT,
			white_accuracy DOUBLE,
			black_accuracy DOUBLE,
			white_cpl DOUBLE,
			black_cpl DOUBLE,
			pgn TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
	default: // sqlite
		usersSchema = `
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`
		gamesSchema = `
		CREATE TABLE IF NOT EXISTS games (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER REFERENCES users(id),
			event TEXT,
			date TEXT,
			result TEXT,
			white_name TEXT,
			black_name TEXT,
			white_elo INTEGER,
			black_elo INTEGER,
			white_accuracy REAL,
			black_accuracy REAL,
			white_cpl REAL,
			black_cpl REAL,
			pgn TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`
	}

	if _, err := s.DB.Exec(usersSchema); err != nil {
		return fmt.Errorf("failed to create users table: %w", err)
	}

	if _, err := s.DB.Exec(gamesSchema); err != nil {
		return fmt.Errorf("failed to create games table: %w", err)
	}

	// Try to add user_id column to existing games table if it was created in previous versions
	var alterStmt string
	if s.DBType == "mysql" {
		alterStmt = "ALTER TABLE games ADD COLUMN user_id INT REFERENCES users(id)"
	} else {
		alterStmt = "ALTER TABLE games ADD COLUMN user_id INTEGER REFERENCES users(id)"
	}
	// Execute it and ignore any error (e.g. "duplicate column name")
	_ = s.DB.QueryRow(alterStmt)

	// Create index on games (user_id, created_at DESC) for fast queries and sorting
	var indexStmt string
	if s.DBType == "mysql" {
		indexStmt = "CREATE INDEX idx_games_user_created ON games (user_id, created_at DESC)"
	} else {
		indexStmt = "CREATE INDEX IF NOT EXISTS idx_games_user_created ON games (user_id, created_at DESC)"
	}
	// Ignore errors if the index already exists (e.g. index already exists on SQLite/Postgres)
	_ = s.DB.QueryRow(indexStmt)

	return nil
}
