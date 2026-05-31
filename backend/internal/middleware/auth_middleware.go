package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserIDKey contextKey = "userId"

const AuthCookieName = "brilliant_chess_auth"

type AuthMiddleware struct {
	jwtSecret []byte
}

func NewAuthMiddleware(secret string) *AuthMiddleware {
	return &AuthMiddleware{jwtSecret: []byte(secret)}
}

func NewAuthCookie(r *http.Request, token string, maxAge int) *http.Cookie {
	secure := r.TLS != nil || strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https")
	return &http.Cookie{
		Name:     AuthCookieName,
		Value:    token,
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
	}
}

func ClearAuthCookie(r *http.Request) *http.Cookie {
	cookie := NewAuthCookie(r, "", -1)
	cookie.Expires = time.Unix(0, 0)
	return cookie
}

func ExtractAuthToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
			return parts[1]
		}
	}

	cookie, err := r.Cookie(AuthCookieName)
	if err == nil {
		return cookie.Value
	}

	return ""
}

func (m *AuthMiddleware) Handler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := ExtractAuthToken(r)
		if tokenString == "" {
			next.ServeHTTP(w, r)
			return
		}
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return m.jwtSecret, nil
		})

		if err != nil || !token.Valid {
			next.ServeHTTP(w, r)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			next.ServeHTTP(w, r)
			return
		}

		userIdFloat, ok := claims["userId"].(float64)
		if !ok {
			next.ServeHTTP(w, r)
			return
		}

		ctx := context.WithValue(r.Context(), UserIDKey, int64(userIdFloat))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireAuth helper middleware that returns 401 if user_id is not injected
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userId := r.Context().Value(UserIDKey)
		if userId == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}
