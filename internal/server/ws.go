package server

import (
	"context"
	"log"
	"net/http"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
	"github.com/nbursa/axon/internal/memory"
)

func HandleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		OriginPatterns: []string{"*"},
	})
	if err != nil {
		log.Println("WebSocket accept failed:", err)
		return
	}
	defer conn.Close(websocket.StatusInternalError, "internal error")

	ctx := context.Background()

	for {
		var envelope map[string]interface{}
		if err := wsjson.Read(ctx, conn, &envelope); err != nil {
			log.Println("WS read error:", err)
			break
		}

		log.Println("Raw envelope received:", envelope)

		switch envelope["type"] {
		case "user_msg", "assistant_msg":
			sessionID, _ := envelope["session_id"].(string)
			text, _ := envelope["text"].(string)
			role := "user"
			if envelope["type"] == "assistant_msg" {
				role = "assistant"
			}
			memory.AppendToSessionLog(sessionID, role, text)
			wsjson.Write(ctx, conn, map[string]string{"type": "ack", "msg": "logged"})

		default:
			log.Println("Unknown message type:", envelope["type"])
			wsjson.Write(ctx, conn, map[string]string{"type": "error", "err": "unknown type"})
		}
	}

	conn.Close(websocket.StatusNormalClosure, "")
}
