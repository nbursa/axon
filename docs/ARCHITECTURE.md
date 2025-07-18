# Axon Companion – Architecture (Zero-API)

## Overview

Axon is a local cognitive layer sitting between the user and ChatGPT (web interface). It logs conversations, distills a long-term profile, and injects personalization back into GPT through UI-level prompt injection.

---

## System Components

### 1. Chat Interceptor (Browser Extension Content Script)

- Watches the ChatGPT window DOM (MutationObserver).
- Captures user input before sending.
- Captures assistant output upon arrival.
- Adds a personalization message to the top of the input (or UI preview) if needed.
- Communicates with the local daemon via WebSocket (native messaging fallback).

### 2. Axon Core Daemon (Go)

- Receives events: `UserMessage`, `AssistantMessage`, `SessionEnd`, `SummarizeRequest`.
- Logs raw sessions (`storage/sessions/*.jsonl`).
- Runs summarization processes (via extension automation — see below).
- Updates `user_profile.yaml`.
- Calculates personalization context on each prompt injection request.

### 3. Summarization Trigger (UI Automation)

- When session > N messages *or* manual click:
  - The extension inserts a prompt to ChatGPT: “Summarize this history ... YAML format ...”
  - ChatGPT generates a summary in chat (hidden thread or modal).
  - Content script parses the result and sends it to the daemon.

### 4. Memory Store

- **STM**: current thread (last X messages).
- **MTM**: aggregate session summaries clustered by topics (optional embed matching).
- **LTM**: `user_profile.yaml` (preferences, style, topics, blind spots, knowledge).

### 5. Prompt Composer

- Input: `user_profile`, `recent_session_context`, `user_input`.
- Output: string for injection before ChatGPT message.
- Dynamically trims context based on max token budget.
- Adds meta instructions (tone, verbosity, error-correct, challenge bias).

### 6. Extension Popup UI

- ON/OFF personalization.
- Manual Summarize.
- Preview active injection prompt.
- Edit `user_profile` fields (tone, verbosity…).
- Export / Import.

---

## Data Flow

┌───────────────┐   user text   ┌─────────────┐   inj.prompt+user   ┌───────────┐
│ User (browser)├──────────────►│ Interceptor ├────────────────────►│ ChatGPT UI│
└─────┬─────────┘               └────┬────────┘                    └────┬──────┘
│ captured messages             │ ws events                         │ replies
▼                               ▼                                   ▼
┌───────────────┐            ┌────────────────┐                    ┌────────────┐
│ Axon Daemon   │◄───────────┤ ws: message log│                    │ Interceptor│
│ (Go)          │            └────────────────┘                    └────────────┘
│   ├─ log sessions                                               (send to daemon)
│   ├─ summarization trigger
│   ├─ update YAML profile
│   └─ return inject context
└───────────────┘


---

## Memory Model

| Layer | Scope | Lifecycle | Stored As | Purpose |
|-------|-------|-----------|-----------|---------|
| STM | last N messages | volatile | array | local context |
| MTM | session summary chunks | periodic | jsonl | thematic signal |
| LTM | user profile | persistent | YAML | personalization |

---

## YAML Profile Merge Rules

1. New signal > old if repeated ≥K times in X days.
2. Conflict? Mark field `confidence: med/low`.
3. Unknown preference → do not inject.

---

## Zero-API Summarization Strategy

- Summarization is done through the GPT UI:
  1. Extension generates payload: recent session text.
  2. Opens hidden “Axon Summarizer” thread.
  3. Inserts special prompt (see `PROMPT_SUMMARY.md`).
  4. Waits for response; validates YAML block; sends to daemon.

---

## Token Budgeting

- Hard limit injection (config, e.g. 900 tokens).
- Preferred priority: tone prefs > blindspot warnings > topical hints > history examples.
- When no space: inject only meta-tone + 1 topical hint.

---

## Failure Modes & Recovery

| Failure | Detection | Recovery |
|---------|-----------|----------|
| ChatGPT DOM changed | Missing selectors | Fallback query + disable injection + UI warning |
| Summarization output noisy | YAML parse fail | Retry w/ stricter prompt; mark session unsummarized |
| Profile blow-up (too big) | size > max | compress fields; drop oldest low-weight topics |

---

## Build Targets

- `axond` (Go daemon)
- `axon-extension` (Chrome dev build)
- later: Firefox / Safari variant

---

## Security Notes

- All data local (gitignored).
- No external telemetry sent.
- “Nuke memory” option clears `storage/`.

---

## Next

See: `ROADMAP.md`, `PROFILE_SCHEMA.md`, `PROMPT_DESIGN.md`.
