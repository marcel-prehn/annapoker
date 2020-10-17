package main

import (
	"go.uber.org/fx"
	"marcel.works/annapoker/app"
	"marcel.works/annapoker/app/logging"
	"marcel.works/annapoker/app/service"
)

func main() {
	fx.New(
		service.RedisServiceModule,
		service.StompServiceModule,
		logging.Module,
		fx.Invoke(app.Start),
	).Run()
}
