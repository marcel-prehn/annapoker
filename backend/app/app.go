package app

import (
	"go.uber.org/fx"
	"go.uber.org/zap"
	"marcel.works/annapoker/app/service"
	"os"
)

var stop = make(chan bool)

type Params struct {
	fx.In
	StompService service.StompService
	DbService    service.RedisService
	Logger       *zap.Logger
}

func Start(p Params) {
	err := p.DbService.Connect()
	if err != nil {
		p.Logger.Error("could not connect to database", zap.Error(err))
		os.Exit(1)
	}
	p.Logger.Info("connected to database")

	err = p.StompService.Connect()
	if err != nil {
		p.Logger.Error("could not connect to broker", zap.Error(err))
		os.Exit(1)
	}
	p.Logger.Info("connected to broker")

	go p.StompService.ReceiveCommands()
	p.Logger.Info("application started")

	<-stop
}
