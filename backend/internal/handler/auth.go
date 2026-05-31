package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"chess-backend/internal/middleware"
	"chess-backend/internal/service"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	dbSvc     *service.DBService
	jwtSecret []byte
}

func NewAuthHandler(dbSvc *service.DBService, jwtSecret string) *AuthHandler {
	return &AuthHandler{
		dbSvc:     dbSvc,
		jwtSecret: []byte(jwtSecret),
	}
}

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Success bool   `json:"success"`
	Token   string `json:"token,omitempty"`
	Error   string `json:"error,omitempty"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Username == "" || req.Password == "" {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Insert into DB
	query := `INSERT INTO users (username, password_hash) VALUES (?, ?)`
	_, err = h.dbSvc.DB.Exec(h.dbSvc.Rebind(query), req.Username, string(hashedPassword))
	if err != nil {
		// Detect duplicate username
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(AuthResponse{Success: false, Error: "Username already exists"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(AuthResponse{Success: true})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Username == "" || req.Password == "" {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	// Fetch user from DB
	var id int64
	var passwordHash string
	query := `SELECT id, password_hash FROM users WHERE username = ?`
	err := h.dbSvc.DB.QueryRow(h.dbSvc.Rebind(query), req.Username).Scan(&id, &passwordHash)
	if err == sql.ErrNoRows {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(AuthResponse{Success: false, Error: "Invalid username or password"})
		return
	} else if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(AuthResponse{Success: false, Error: "Invalid username or password"})
		return
	}

	// Generate JWT Token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId":   id,
		"username": req.Username,
		"exp":      time.Now().Add(24 * 7 * time.Hour).Unix(), // 7 days expiration
	})

	tokenString, err := token.SignedString(h.jwtSecret)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuthResponse{Success: true, Token: tokenString})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userIdVal := r.Context().Value(middleware.UserIDKey)
	if userIdVal == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userId := userIdVal.(int64)

	var username string
	var createdAt string
	query := `SELECT username, created_at FROM users WHERE id = ?`
	err := h.dbSvc.DB.QueryRow(h.dbSvc.Rebind(query), userId).Scan(&username, &createdAt)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":        userId,
		"username":  username,
		"createdAt": createdAt,
		"dbType":    h.dbSvc.DBType,
	})
}
