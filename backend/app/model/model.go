package model

import "time"

type Command struct {
	Cmd       string `json:"cmd"`
	User      User   `json:"user"`
	SessionId string `json:"sessionId"`
}

type Broadcast struct {
	Type      string      `json:"type"`
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
}

type User struct {
	Uuid     string `json:"uuid"`
	Username string `json:"username"`
	Voting   string `json:"voting"`
}

type Session struct {
	Id        string    `json:"id"`
	Users     []User    `json:"users"`
	Timestamp time.Time `json:"timestamp"`
}
