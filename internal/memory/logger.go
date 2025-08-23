package memory

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

type LogEntry struct {
	Timestamp string `json:"ts"`
	Role      string `json:"role"`
	Text      string `json:"text"`
}

// AppendToSessionLog writes a single message line to session log file.
func AppendToSessionLog(sessionID, role, text string) error {
	if sessionID == "" {
		sessionID = "default"
	}
	entry := LogEntry{
		Timestamp: time.Now().Format(time.RFC3339),
		Role:      role,
		Text:      text,
	}

	filePath := filepath.Join(SessionDir, fmt.Sprintf("%s.jsonl", sessionID))
	f, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}
	defer f.Close()

	b, err := json.Marshal(entry)
	if err != nil {
		return err
	}
	_, err = f.Write(append(b, '\n'))
	return err
}
