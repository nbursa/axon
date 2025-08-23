# Axon Companion (Working Name)

**Local memory layer that personalizes your ChatGPT interaction - without API.**

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

```text
User ↔ ChatGPT UI
       ↑ (content script interceptor)
       │
       │  - Save input/output
       │  - Inject personalization
       │
       └──▶ Axon Go Daemon (local)
            ├─ Logs session data
            ├─ Periodically asks GPT to summarize history (via hidden prompt)
            ├─ Updates `user_profile.yaml`
            └─ Sends back compact context for next messages
```

---

## Core Features (MVP Scope)

- [x] Capture ChatGPT messages (user + assistant).
- [x] Local session log.
- [ ] Manual trigger of “Summarize session” (auto later).
- [x] GPT summary → structured YAML update (preferences, topics, style).
- [ ] Prompt injection from YAML + current input.
- [ ] Extension popup: display active memory + ON/OFF personalization.
- [ ] Export / import profile.

---

## Quick Start (dev)

1. `git clone … && cd axon`
2. Install and run the local daemon **with TLS** (ChatGPT runs on https, so the extension connects via WSS):
   - (macOS) `brew install mkcert nss`
   - `mkcert -install`
   - `mkcert -key-file key.pem -cert-file cert.pem "localhost" 127.0.0.1 ::1`
   - `go mod tidy`
   - `go run ./cmd/axond -tls -cert cert.pem -key key.pem`  
     (This prints: `Axon Daemon running on wss://localhost:7381/ws`)

3. Build the extension:

   ```bash
   cd web/extension
   npm install
   npm run build
   cd ../../
   ```

4. In Chrome: open **chrome://extensions** → enable **Developer mode** → **Load unpacked** → select `web/extension/`.

5. Open ChatGPT (`https://chatgpt.com`) → send a message.  
   You should see JSONL appended under `storage/sessions/` (e.g. `sess_<timestamp>.jsonl`).

---

## Repo Layout

```text
cmd/axond/           # Go daemon entry
internal/memory/     # STM/MTM/LTM, YAML profile
internal/prompt/     # Prompt builder + token budgeting
internal/server/     # WebSocket / control API
web/extension/       # Browser extension (content + popup)
storage/             # Local data (gitignore)
docs/                # Architecture, roadmap, schema
```

---

## License

This project is released under the [**Axon Personal Use License v1.0**](LICENCE)
It allows free use for learning, research, and local personal use.  
Commercial use or redistribution is **not permitted**.

For business/commercial licensing, contact: <https://nenadbursac.com/contact>

---

## Privacy Policy

See: [Privacy Policy](https://nbursa.github.io/axon/privacy.html)

---

## Related Projects

Axon is part of a broader research direction on structured synthetic memory and interpretable cognitive systems.

- [EgoAI](https://github.com/nbursa/EgoAI) – Executive loop for perception, semantic reasoning, and goal processing. Uses structured memory via Sentience + Inception.
- [Inception-core](https://github.com/nbursa/inception-core) – Cortex-like memory server for STM/LTM storage and semantic memory graph.
- [Sentience](https://github.com/nbursa/sentience) – DSL for encoding and transforming semantic tokens for memory and reasoning.

While Axon focuses on aligning and extending LLM behavior via memory, EgoAI explores the same concept without LLMs - using structured memory alone as the basis for reasoning and adaptation.
