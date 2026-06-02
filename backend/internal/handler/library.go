package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"chess-backend/internal/middleware"
	"chess-backend/internal/service"
)

type LibraryHandler struct {
	dbSvc *service.DBService
}

func NewLibraryHandler(dbSvc *service.DBService) *LibraryHandler {
	return &LibraryHandler{dbSvc: dbSvc}
}

type GameResponse struct {
	ID            int64   `json:"id"`
	Event         string  `json:"event"`
	Date          string  `json:"date"`
	Result        string  `json:"result"`
	WhiteName     string  `json:"whiteName"`
	BlackName     string  `json:"blackName"`
	WhiteElo      int     `json:"whiteElo"`
	BlackElo      int     `json:"blackElo"`
	WhiteAccuracy float64 `json:"whiteAccuracy"`
	BlackAccuracy float64 `json:"blackAccuracy"`
	WhiteCPL      float64 `json:"whiteCpl"`
	BlackCPL      float64 `json:"blackCpl"`
	PGN           string  `json:"pgn,omitempty"`
	CreatedAt     string  `json:"createdAt"`
}

type SaveGameRequest struct {
	PGN           string  `json:"pgn"`
	WhiteAccuracy float64 `json:"whiteAccuracy"`
	BlackAccuracy float64 `json:"blackAccuracy"`
	WhiteCPL      float64 `json:"whiteCpl"`
	BlackCPL      float64 `json:"blackCpl"`
}

type StatsResponse struct {
	TotalGames      int                  `json:"totalGames"`
	AverageAccuracy float64              `json:"averageAccuracy"`
	AverageCPL      float64              `json:"averageCpl"`
	GamesByResult   map[string]int       `json:"gamesByResult"`
	AccuracyTrend   []AccuracyTrendPoint `json:"accuracyTrend"`
}

type AccuracyTrendPoint struct {
	Date          string  `json:"date"`
	WhiteAccuracy float64 `json:"whiteAccuracy"`
	BlackAccuracy float64 `json:"blackAccuracy"`
}

func (h *LibraryHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if path == "/api/games" {
		switch r.Method {
		case http.MethodGet:
			h.listGames(w, r)
		case http.MethodPost:
			h.saveGame(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	} else if strings.HasPrefix(path, "/api/games/") {
		idStr := r.PathValue("id")
		if idStr == "" {
			idStr = strings.TrimPrefix(path, "/api/games/")
		}

		switch r.Method {
		case http.MethodGet:
			h.getGame(w, r, idStr)
		case http.MethodDelete:
			h.deleteGame(w, r, idStr)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	} else if path == "/api/stats" {
		if r.Method == http.MethodGet {
			h.getStats(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	} else {
		http.NotFound(w, r)
	}
}

func (h *LibraryHandler) listGames(w http.ResponseWriter, r *http.Request) {
	userIdVal := r.Context().Value(middleware.UserIDKey)
	if userIdVal == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userId := userIdVal.(int64)

	rows, err := h.dbSvc.DB.Query(h.dbSvc.Rebind(`
		SELECT id, event, date, result, white_name, black_name, white_elo, black_elo, white_accuracy, black_accuracy, white_cpl, black_cpl, created_at 
		FROM games 
		WHERE user_id = ?
		ORDER BY date DESC, id DESC
	`), userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	games := []GameResponse{}
	for rows.Next() {
		var g GameResponse
		err := rows.Scan(&g.ID, &g.Event, &g.Date, &g.Result, &g.WhiteName, &g.BlackName, &g.WhiteElo, &g.BlackElo, &g.WhiteAccuracy, &g.BlackAccuracy, &g.WhiteCPL, &g.BlackCPL, &g.CreatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		games = append(games, g)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(games)
}

func (h *LibraryHandler) saveGame(w http.ResponseWriter, r *http.Request) {
	userIdVal := r.Context().Value(middleware.UserIDKey)
	if userIdVal == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userId := userIdVal.(int64)

	var req SaveGameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	event := parsePgnTag(req.PGN, "Event")
	if event == "" {
		event = "Casual Game"
	}
	date := parsePgnTag(req.PGN, "Date")
	if date == "" {
		date = "?.?.?"
	}
	result := parsePgnTag(req.PGN, "Result")
	if result == "" {
		result = "*"
	}
	whiteName := parsePgnTag(req.PGN, "White")
	if whiteName == "" {
		whiteName = "White"
	}
	blackName := parsePgnTag(req.PGN, "Black")
	if blackName == "" {
		blackName = "Black"
	}
	whiteElo, _ := strconv.Atoi(parsePgnTag(req.PGN, "WhiteElo"))
	blackElo, _ := strconv.Atoi(parsePgnTag(req.PGN, "BlackElo"))

	res, err := h.dbSvc.DB.Exec(h.dbSvc.Rebind(`
		INSERT INTO games (user_id, event, date, result, white_name, black_name, white_elo, black_elo, white_accuracy, black_accuracy, white_cpl, black_cpl, pgn)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`), userId, event, date, result, whiteName, blackName, whiteElo, blackElo, req.WhiteAccuracy, req.BlackAccuracy, req.WhiteCPL, req.BlackCPL, req.PGN)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	id, _ := res.LastInsertId()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"id":      id,
	})
}

func (h *LibraryHandler) getGame(w http.ResponseWriter, r *http.Request, idStr string) {
	userIdVal := r.Context().Value(middleware.UserIDKey)
	if userIdVal == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userId := userIdVal.(int64)

	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var g GameResponse
	err = h.dbSvc.DB.QueryRow(h.dbSvc.Rebind(`
		SELECT id, event, date, result, white_name, black_name, white_elo, black_elo, white_accuracy, black_accuracy, white_cpl, black_cpl, pgn, created_at 
		FROM games 
		WHERE id = ? AND user_id = ?
	`), id, userId).Scan(&g.ID, &g.Event, &g.Date, &g.Result, &g.WhiteName, &g.BlackName, &g.WhiteElo, &g.BlackElo, &g.WhiteAccuracy, &g.BlackAccuracy, &g.WhiteCPL, &g.BlackCPL, &g.PGN, &g.CreatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(g)
}

func (h *LibraryHandler) deleteGame(w http.ResponseWriter, r *http.Request, idStr string) {
	userIdVal := r.Context().Value(middleware.UserIDKey)
	if userIdVal == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userId := userIdVal.(int64)

	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	_, err = h.dbSvc.DB.Exec(h.dbSvc.Rebind(`DELETE FROM games WHERE id = ? AND user_id = ?`), id, userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func (h *LibraryHandler) getStats(w http.ResponseWriter, r *http.Request) {
	userIdVal := r.Context().Value(middleware.UserIDKey)
	if userIdVal == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userId := userIdVal.(int64)

	var total int
	err := h.dbSvc.DB.QueryRow(h.dbSvc.Rebind(`SELECT COUNT(*) FROM games WHERE user_id = ?`), userId).Scan(&total)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if total == 0 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(StatsResponse{
			TotalGames:    0,
			GamesByResult: make(map[string]int),
			AccuracyTrend: []AccuracyTrendPoint{},
		})
		return
	}

	var avgAccuracy, avgCpl float64
	err = h.dbSvc.DB.QueryRow(h.dbSvc.Rebind(`
		SELECT COALESCE(AVG((white_accuracy + black_accuracy) / 2.0), 0),
		       COALESCE(AVG((white_cpl + black_cpl) / 2.0), 0)
		FROM games
		WHERE user_id = ?
	`), userId).Scan(&avgAccuracy, &avgCpl)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rows, err := h.dbSvc.DB.Query(h.dbSvc.Rebind(`SELECT result, COUNT(*) FROM games WHERE user_id = ? GROUP BY result`), userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	results := make(map[string]int)
	for rows.Next() {
		var res string
		var count int
		if err := rows.Scan(&res, &count); err == nil {
			results[res] = count
		}
	}

	trendRows, err := h.dbSvc.DB.Query(h.dbSvc.Rebind(`
		SELECT date, white_accuracy, black_accuracy 
		FROM games 
		WHERE user_id = ?
		ORDER BY date ASC, id ASC 
		LIMIT 10
	`), userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer trendRows.Close()

	trend := []AccuracyTrendPoint{}
	for trendRows.Next() {
		var pt AccuracyTrendPoint
		if err := trendRows.Scan(&pt.Date, &pt.WhiteAccuracy, &pt.BlackAccuracy); err == nil {
			trend = append(trend, pt)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(StatsResponse{
		TotalGames:      total,
		AverageAccuracy: avgAccuracy,
		AverageCPL:      avgCpl,
		GamesByResult:   results,
		AccuracyTrend:   trend,
	})
}

func parsePgnTag(pgn, tag string) string {
	pattern := "[" + tag + " \""
	idx := strings.Index(pgn, pattern)
	if idx == -1 {
		return ""
	}
	start := idx + len(pattern)
	end := strings.Index(pgn[start:], "\"]")
	if end == -1 {
		return ""
	}
	return pgn[start : start+end]
}
