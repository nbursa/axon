package memory

import (
	"log"
	"os"
	"path/filepath"
)

var (
	StorageRoot     = getEnv("AXON_STORAGE", "./storage")
	SessionDir      = filepath.Join(StorageRoot, "sessions")
	ProfileDir      = filepath.Join(StorageRoot, "profiles")
	DefaultProfile  = filepath.Join(ProfileDir, "default.yaml")
	ConfigFile      = filepath.Join(StorageRoot, "config.yaml")
	MaxPromptTokens = 900 // fallback default
)

func InitStorageDirs() {
	dirs := []string{SessionDir, ProfileDir}
	for _, d := range dirs {
		if err := os.MkdirAll(d, 0755); err != nil {
			log.Fatalf("Failed to create directory %s: %v", d, err)
		}
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
