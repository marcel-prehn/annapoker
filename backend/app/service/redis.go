package service

import (
	"context"
	"github.com/go-redis/redis/v8"
	"github.com/segmentio/encoding/json"
	"go.uber.org/fx"
	"go.uber.org/zap"
	"marcel.works/annapoker/app/model"
	"os"
	"time"
)

var RedisServiceModule = fx.Provide(NewRedisService)

const TTL = 4 * time.Hour

type redisService struct {
	client *redis.Client
	ctx    context.Context
	logger *zap.Logger
}

type RedisService interface {
	Connect() error
	InsertSession(sessionId string) error
	AddUserToSession(sessionId string, user model.User) error
	RemoveUserFromSession(sessionId string, user model.User) error
	GetUsers(sessionId string) ([]model.User, error)
	UpdateUser(sessionId string, user model.User) error
	ResetVotings(sessionId string) error
	CountVotings(sessionId string) (int, error)
	getSession(sessionId string) (*model.Session, error)
}

func NewRedisService(logger *zap.Logger) RedisService {
	return &redisService{
		logger: logger,
	}
}

func (s *redisService) Connect() error {
	auth := os.Getenv("ANNAPOKER_DB_AUTH")
	host := os.Getenv("ANNAPOKER_DB_HOST")
	if host == "" {
		host = "localhost:6379"
	}
	s.client = redis.NewClient(&redis.Options{
		Addr:     host,
		Password: auth,
		DB:       0,
	})
	s.ctx = context.Background()
	return s.client.Ping(s.ctx).Err()
}

func (s *redisService) InsertSession(sessionId string) error {
	session := model.Session{
		Id:        sessionId,
		Users:     nil,
		Timestamp: time.Now(),
	}
	payload, _ := json.Marshal(session)
	return s.client.Set(s.ctx, sessionId, payload, TTL).Err()
}

func (s *redisService) AddUserToSession(sessionId string, user model.User) error {
	session, err := s.getSession(sessionId)
	if err != nil {
		return err
	}
	session.Users = append(session.Users, user)
	outbound, err := json.Marshal(session)
	if err != nil {
		return err
	}
	return s.client.Set(s.ctx, sessionId, outbound, TTL).Err()
}

func (s *redisService) RemoveUserFromSession(sessionId string, user model.User) error {
	session, err := s.getSession(sessionId)
	if err != nil {
		return err
	}
	for index, u := range session.Users {
		if user.Uuid == u.Uuid {
			session.Users[index] = session.Users[len(session.Users)-1]
			session.Users = session.Users[:len(session.Users)-1]
		}
	}
	payload, err := json.Marshal(session)
	if err != nil {
		return err
	}
	return s.client.Set(s.ctx, sessionId, payload, TTL).Err()
}

func (s *redisService) GetUsers(sessionId string) ([]model.User, error) {
	session, err := s.getSession(sessionId)
	if err != nil {
		return nil, err
	}
	return session.Users, nil
}

func (s *redisService) UpdateUser(sessionId string, user model.User) error {
	session, err := s.getSession(sessionId)
	if err != nil {
		return err
	}
	for index, u := range session.Users {
		if u.Uuid == user.Uuid {
			session.Users[index].Voting = user.Voting
		}
	}
	payload, err := json.Marshal(session)
	if err != nil {
		return err
	}
	return s.client.Set(s.ctx, sessionId, payload, TTL).Err()
}

func (s *redisService) ResetVotings(sessionId string) error {
	session, err := s.getSession(sessionId)
	if err != nil {
		return err
	}
	for index := range session.Users {
		session.Users[index].Voting = "0"
	}
	payload, err := json.Marshal(session)
	if err != nil {
		return err
	}
	return s.client.Set(s.ctx, sessionId, payload, TTL).Err()
}

func (s *redisService) CountVotings(sessionId string) (int, error) {
	counter := 0
	session, err := s.getSession(sessionId)
	if err != nil {
		return -1, err
	}
	for index := range session.Users {
		if session.Users[index].Voting == "0" {
			counter++
		}
	}
	return counter, nil
}

func (s *redisService) getSession(sessionId string) (*model.Session, error) {
	payload, err := s.client.Get(s.ctx, sessionId).Result()
	if err != nil {
		return nil, err
	}
	var session model.Session
	err = json.Unmarshal([]byte(payload), &session)
	if err != nil {
		return nil, err
	}
	return &session, nil
}
