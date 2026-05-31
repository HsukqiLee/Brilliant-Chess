# Stage 1: Build the Go binary
FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# Stage 2: Run the binary
FROM alpine:3.23
WORKDIR /app
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
