package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"

	"github.com/nbursa/axon/internal/memory"
	"github.com/nbursa/axon/internal/server"
)

func main() {
	// ensure storage layout exists (sessions/, profiles/)
	memory.InitStorageDirs()

	useTLS := flag.Bool("tls", false, "serve WSS with TLS cert.pem/key.pem")
	addr := flag.String("addr", ":7381", "listen address")
	certFile := flag.String("cert", "cert.pem", "TLS cert file")
	keyFile := flag.String("key", "key.pem", "TLS key file")
	flag.Parse()

	http.HandleFunc("/ws", server.HandleWS)

	if *useTLS {
		fmt.Printf("Axon Daemon running on wss://localhost%s/ws\n", *addr)
		log.Fatal(http.ListenAndServeTLS(*addr, *certFile, *keyFile, nil))
		return
	}

	// Dev mode without TLS to avoid browser self-signed cert issues
	fmt.Printf("Axon Daemon running on ws://localhost%s/ws\n", *addr)
	log.Fatal(http.ListenAndServe(*addr, nil))
}
