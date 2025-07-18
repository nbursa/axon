# Dev Guide

## Requirements

- Go 1.22+
- Node 20+ (if you use build tooling for popup UI)
- Chrome/Chromium for extension development
- Make (optional)

---

## Build Daemon

```bash
go run ./cmd/axond
# or
go build -o bin/axond ./cmd/axond
./bin/axond --storage ./storage
Daemon exposes:
 • WS: ws://localhost:7381
 • REST (optional): http://localhost:7381/status

⸻

Extension (dev load)
 1. cd web/extension
 2. npm install (if you use build)
 3. npm run build → dist/
 4. Chrome → Extensions → Developer Mode → Load Unpacked → dist/

⸻

Debug flow
 • Open ChatGPT.
 • DevTools Console: check that AXON connected.
 • Send a message → see log in daemon stdout.
 • Click popup → “Summarize” → check YAML update.

⸻

Storage Layout
storage/
 ├── sessions/
 │   ├── sess_2025-07-18_142012.jsonl
 │   └── ...
 ├── profiles/
 │   └── default.yaml
 └── tmp/
     └── session_chunk.txt


⸻

Messaging Contract (WS)

Inbound (from extension):
{ "type": "user_msg", "session_id": "...", "text": "..." }
{ "type": "assistant_msg", "session_id": "...", "text": "..." }
{ "type": "summarized", "session_id": "...", "yaml": "...yaml text..." }
{ "type": "inject_request", "session_id": "...", "user_text": "..." }

Outbound (from daemon):

{ "type": "inject_response", "prompt": "...string..." }
{ "type": "ack", "msg": "logged" }
{ "type": "error", "err": "..." }

⸻

Test Without GPT

Set DEV_FAKE_SUMMARY=true and the daemon will generate fake YAML memory for fast injection tests.

⸻

Style
 • No global state; session_id mandatory.
 • All asynchronous via goroutines + channels.
 • Log format: JSON per line.

⸻

Lint

golangci-lint run

⸻

Release Checklist
 • Build daemon (linux/mac)
 • Build extension (zip)
 • Test summarization 3x
 • Profile merge works
 • Token length test
 • README gif
---
