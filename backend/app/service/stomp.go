package service

import (
	"encoding/json"
	"github.com/go-stomp/stomp"
	"go.uber.org/fx"
	"go.uber.org/zap"
	"marcel.works/annapoker/app/model"
	"os"
	"time"
)

var StompServiceModule = fx.Provide(NewStompService)

const (
	_topicCommand   = "/topic/go_stomp_command"
	_topicBroadcast = "/topic/go_stomp_broadcast"
)

type stompService struct {
	connection *stomp.Conn
	dbService  RedisService
	logger     *zap.Logger
}

type StompService interface {
	Connect() error
	ReceiveCommands()
	CreateSession(sessionId string)
	PublishUsers(sessionId string)
	PublishUpdateUsers(sessionId string)
	ResetVotings(sessionId string)
	RevealVotings(sessionId string)
	SaveUser(command model.Command)
	UpdateVoting(command model.Command)
	RemoveUser(command model.Command)
	SendBroadcast(typ string, sessionId string, data interface{})
	getCredentials() (string, string, string)
}

func NewStompService(dbService RedisService, logger *zap.Logger) StompService {
	return &stompService{
		dbService: dbService,
		logger:    logger,
	}
}

func (s *stompService) Connect() error {
	brokerHost, brokerUser, brokerPass := s.getCredentials()
	options := []func(conn *stomp.Conn) error{
		stomp.ConnOpt.Login(brokerUser, brokerPass),
		stomp.ConnOpt.Host("/"),
	}
	connection, err := stomp.Dial("tcp", brokerHost, options...)
	if err != nil {
		return err
	}
	s.connection = connection
	return nil
}

func (s *stompService) ReceiveCommands() {
	subscription, err := s.connection.Subscribe(_topicCommand, stomp.AckAuto)
	if err != nil {
		s.logger.Error("cannot subscribe to topic", zap.String("topic", _topicCommand), zap.Error(err))
	}
	s.logger.Info("subscribed to topic", zap.String("topic", _topicCommand))

	var command model.Command
	for true {
		message := <-subscription.C
		_ = json.Unmarshal(message.Body, &command)
		s.logger.Info(">>> received command",
			zap.String("command", command.Cmd),
			zap.Any("user", command.User),
			zap.String("sessionid", command.SessionId))
		switch command.Cmd {
		case "CREATE_SESSION":
			s.CreateSession(command.SessionId)
		case "SAVE_USER":
			s.SaveUser(command)
			s.PublishUsers(command.SessionId)
		case "GET_USERS":
			s.PublishUsers(command.SessionId)
		case "UPDATE_VOTING":
			s.UpdateVoting(command)
			s.PublishUsers(command.SessionId)
		case "RESET_VOTINGS":
			s.ResetVotings(command.SessionId)
			s.PublishVotingsReset(command.SessionId)
		case "REMOVE_PLAYER":
			s.RemoveUser(command)
			s.SendBroadcast("PLAYER_REMOVED", command.SessionId, command.User)
			s.PublishUsers(command.SessionId)
		case "REVEAL_VOTINGS":
			s.RevealVotings(command.SessionId)
		}
	}
}

func (s *stompService) CreateSession(sessionId string) {
	err := s.dbService.InsertSession(sessionId)
	if err != nil {
		s.logger.Error("could not create new session",
			zap.String("sessionId", sessionId),
			zap.Error(err))
	}
}

func (s *stompService) PublishUsers(sessionId string) {
	users, err := s.dbService.GetUsers(sessionId)
	if err != nil {
		s.logger.Error("empty session or session not found",
			zap.String("sessionId", sessionId),
			zap.Error(err))
		s.SendBroadcast("NO_SESSION_FOUND", sessionId, nil)
		return
	}
	s.SendBroadcast("GET_USERS", sessionId, users)
}

func (s *stompService) PublishUpdateUsers(sessionId string) {
	users, err := s.dbService.GetUsers(sessionId)
	if err != nil {
		s.logger.Error("empty session or session not found",
			zap.String("sessionId", sessionId),
			zap.Error(err))
		s.SendBroadcast("NO_SESSION_FOUND", sessionId, nil)
		return
	}
	s.SendBroadcast("UPDATE_USERS", sessionId, users)
}

func (s *stompService) PublishVotingsReset(sessionId string) {
	users, err := s.dbService.GetUsers(sessionId)
	if err != nil {
		s.logger.Error("empty session or session not found",
			zap.String("sessionId", sessionId),
			zap.Error(err))
		s.SendBroadcast("NO_SESSION_FOUND", sessionId, nil)
		return
	}
	s.SendBroadcast("VOTINGS_RESET", sessionId, users)
}

func (s *stompService) ResetVotings(sessionId string) {
	err := s.dbService.ResetVotings(sessionId)
	if err != nil {
		s.logger.Error("could not reset votings",
			zap.String("sessionId", sessionId),
			zap.Error(err))
	}
}

func (s *stompService) UpdateVoting(command model.Command) {
	err := s.dbService.UpdateUser(command.SessionId, command.User)
	if err != nil {
		s.logger.Error("could not update voting",
			zap.String("sessionId", command.SessionId),
			zap.String("username", command.User.Username),
			zap.Error(err))
	}

	numberOfVotings, err := s.dbService.CountVotings(command.SessionId)
	if err != nil {
		s.logger.Error("could not count votings", zap.String("sessionId", command.SessionId), zap.Error(err))
	}
	if numberOfVotings == 0 {
		s.RevealVotings(command.SessionId)
	}
}

func (s *stompService) RevealVotings(sessionId string) {
	s.SendBroadcast("VOTINGS_REVEALED", sessionId, nil)
}

func (s *stompService) SaveUser(command model.Command) {
	err := s.dbService.AddUserToSession(command.SessionId, command.User)
	if err != nil {
		s.logger.Error("could not add user to session",
			zap.String("sessionId", command.SessionId),
			zap.String("username", command.User.Username),
			zap.Error(err))
	}
}

func (s *stompService) RemoveUser(command model.Command) {
	err := s.dbService.RemoveUserFromSession(command.SessionId, command.User)
	if err != nil {
		s.logger.Error("could not remove user from session",
			zap.String("sessionId", command.SessionId),
			zap.String("username", command.User.Username),
			zap.Error(err))
	}
}

func (s *stompService) SendBroadcast(typ string, sessionId string, data interface{}) {
	broadcast := model.Broadcast{
		Type:      typ,
		Data:      data,
		Timestamp: time.Now(),
	}
	payload, _ := json.Marshal(broadcast)
	err := s.connection.Send(_topicBroadcast+"."+sessionId, "text/plan", payload)
	if err != nil {
		s.logger.Error("could not send broadcast", zap.String("type", typ), zap.Error(err))
	}
	s.logger.Info("<<< sent broadcast",
		zap.String("type", broadcast.Type),
		zap.Any("data", broadcast.Data))
}

func (s *stompService) getCredentials() (string, string, string) {
	brokerHost := os.Getenv("ANNAPOKER_BROKER_HOST")
	if brokerHost == "" {
		brokerHost = "localhost:61613"
	}
	brokerUser := os.Getenv("ANNAPOKER_BROKER_USER")
	if brokerUser == "" {
		brokerUser = "guest"
	}
	brokerPass := os.Getenv("ANNAPOKER_BROKER_PASS")
	if brokerPass == "" {
		brokerPass = "guest"
	}
	return brokerHost, brokerUser, brokerPass
}
