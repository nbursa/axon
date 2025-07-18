# Dev Guide

## System Module Overview

| Module               | Type                             | Responsibilities                                                                     | Tech Stack                                         |
|----------------------|----------------------------------|----------------------------------------------------------------------------------------|----------------------------------------------------|
| ChatGPT Interceptor  | Browser Extension (Content Script) | Intercept user input/output, inject personalization prompt, log messages to local DB. | JavaScript, Chrome Extension (Manifest V3)         |
| Session Logger       | LocalStorage/IndexedDB Module    | Store recent chat sessions for summarization.                                          | IndexedDB (via Dexie.js or native)                |
| Summarization Engine | Background Script + GPT Prompt / Local LLM | Periodically summarize sessions, extract structured user traits.              | OpenAI GPT prompt or WebAssembly-based LLM (MiniLM, LLaMA.cpp) |
| Long-Term Memory Store | JSON Profile + Embedding Vector Store | Hold persistent facts, preferences, habits, tone, domains of interest.         | JSON, SQLite, FAISS or Qdrant (local)             |
| Memory Manager       | Orchestration Layer              | Merge short-term summaries into long-term schema, resolve conflicts.                   | JS or Python, YAML schema definitions              |
| Prompt Composer      | Injection Engine                 | Compose personalized prompts dynamically using current input + relevant LTM context.   | JS template engine or custom middleware logic      |
| User Interface       | Settings Panel + Memory Viewer   | Allow user to view/edit memory, toggle personalization, export/import profile.         | Vue.js or plain JS, TailwindCSS (embedded in extension popup) |

## Initial project structure plan

```text
axon-companion/
├── cmd/
│   └── axond/                   # Go daemon entry point (main.go)
│
├── internal/
│   ├── memory/                  # STM/MTM/LTM logic, YAML handling
│   ├── prompt/                  # Prompt composer, token budgeting
│   └── server/                  # WS server, message routing
│
├── storage/                     # Local persistent data
│   ├── sessions/               # Raw conversation logs (.jsonl)
│   ├── profiles/               # user_profile.yaml etc.
│   └── tmp/                    # Temporary summarization inputs
│
├── web/
│   └── extension/              # Browser extension
│       ├── content.ts          # DOM interception, mutation observer
│       ├── popup.vue           # UI: settings, preview, memory editor
│       ├── background.ts       # Summarization trigger logic
│       └── manifest.json       # Manifest v3
│
├── docs/                        # Full documentation
│   ├── DEV_GUIDE.md
│   ├── ROADMAP.md
│   ├── PROFILE_SCHEMA.md
│   ├── CUT_SCOPE.md
│   ├── PROMPT_SUMMARY.md
│   ├── CONFIG_OPTIONS.md
│   └── INJECTION_TEMPLATE.md (optional)
│
├── LICENSE.txt                  # Personal Use License (custom)
├── COMMERCIAL-LICENSE.md       # Info on paid licensing (optional)
├── README.md                    # Project overview + GIF + instructions
├── .gitignore                   # storage/, dist/, .env etc.
└── .env.sample                  # Example config for daemon/ext
```

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
