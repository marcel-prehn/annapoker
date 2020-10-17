package logging

import (
	"go.uber.org/fx"
	"go.uber.org/zap"
	"os"
)

var Module = fx.Provide(New)

func New() (*zap.Logger, error) {
	var logger *zap.Logger
	var err error
	if os.Getenv("ANNAPOKER_MODE") == "PROD" {
		logger, err = zap.NewProduction()
	} else {
		logger, err = zap.NewDevelopment()
	}
	if err != nil {
		return nil, err
	}
	return logger, nil
}
