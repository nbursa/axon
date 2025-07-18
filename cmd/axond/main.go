package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/nbursa/axon/internal/server"
)

func main() {
	storageDir := "./storage"
	if err := os.MkdirAll(storageDir+"/sessions", 0755); err != nil {
		log.Fatalf("failed to create sessions directory: %v", err)
	}

	wsPort := ":7381"
	http.HandleFunc("/ws", server.HandleWS)

	fmt.Printf("Axon Daemon running on ws://localhost%s/ws\n", wsPort)
	log.Fatal(http.ListenAndServe(wsPort, nil))
}
