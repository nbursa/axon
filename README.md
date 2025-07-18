# Axon Companion (Working Name)

**Local memory layer that personalizes your ChatGPT interaction — without API.**

Axon is a browser + local daemon system that:

- stores your GPT sessions locally,
- periodically summarizes them through an automated GPT query in the background (UI-level, not API),
- distills a long-term user profile (style, preferences, interest areas, blind spots),
- automatically injects personalized context into ChatGPT before each message,
- allows you insight and control over memory (transparency).

Goal: **AI that truly remembers you and works with you as a cognitive partner.**  
Use case: demonstration of technical capability, research tool, personal productivity layer. Not a commercial product (MVP phase).

---

## Status

**Phase: Pre-MVP Design / Implementation.**  
Zero-API enforced: all GPT interactions work through web UI (content script automation).

---

## High Values

- Local privacy: nothing leaves your computer.
- Transparent memory: YAML profile that you can edit.
- Adaptive injection: concise, contextually relevant prompt, without bloat.
- Model-agnostic: primarily for ChatGPT, but architecture allows Claude / local LLMs.

---

## Quick Work Overview

User ↔ ChatGPT UI
↑ (content script intercepter)
│  save input/output
│  inject personalization
└──▶ Axon Go Daemon (local)
├─ session log
├─ periodically asks GPT to summarize history (hidden prompt)
├─ update user_profile.yaml
└─ sends back compact context for next messages

---

## Core Features (MVP Scope)

- [ ] Capture ChatGPT messages (user + assistant).
- [ ] Local session log.
- [ ] Manual trigger of “Summarize session” (auto later).
- [ ] GPT summary → structured YAML update (preferences, topics, style).
- [ ] Prompt injection from YAML + current input.
- [ ] Extension popup: display active memory + ON/OFF personalization.
- [ ] Export / import profile.

---

## Quick Start (dev)

1. `git clone ...`
2. `cd axon-companion`
3. `go mod tidy`
4. `go run ./cmd/axond` (runs local WebSocket server)
5. In Chrome: load unpacked extension from `web/extension/`
6. Open ChatGPT → write something → check if it logs in `storage/sessions/`
7. Click “Summarize & Update” in popup → check `storage/profiles/<user>.yaml`
8. Enable “Inject Memory” → send next questions to GPT and observe behavior change.

---

## Repo Layout

cmd/axond/           # Go daemon entry
internal/memory/     # STM/MTM/LTM, YAML profile
internal/prompt/     # Prompt builder + token budgeting
internal/server/     # WebSocket / control API
web/extension/       # Browser extension (content + popup)
storage/             # Local data (gitignore)
docs/                # Architecture, roadmap, schema

---

## License

TBD (recommendation: Apache-2.0 or AGPL for defensiveness).

---

## Credits

Core concept: stratified memory (SynthaMind).  
MVP implementation: @Nenad + AI assistance.
