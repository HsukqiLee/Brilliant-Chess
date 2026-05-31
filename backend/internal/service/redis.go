package service

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type CacheService struct {
	client *redis.Client
	ctx    context.Context
}

func NewCacheService(addr, password string) *CacheService {
	if addr == "" {
		return &CacheService{client: nil}
	}

	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       0,
	})

	return &CacheService{
		client: rdb,
		ctx:    context.Background(),
	}
}

func (c *CacheService) Get(key string) (string, error) {
	if c.client == nil {
		return "", redis.Nil
	}
	return c.client.Get(c.ctx, key).Result()
}

func (c *CacheService) Set(key string, value string, expiration time.Duration) error {
	if c.client == nil {
		return nil
	}
	return c.client.Set(c.ctx, key, value, expiration).Err()
}

func (c *CacheService) IsEnabled() bool {
	return c.client != nil
}
