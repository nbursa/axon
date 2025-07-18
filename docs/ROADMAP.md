# Axon MVP Roadmap (Zero-API)

## Phase 0 – Boot

- Repo init, license
- go.mod, basic structure
- build scripts

## Phase 1 – Capture & Log

- Content script captures user and assistant messages
- Sends them to the daemon (ws)
- Local JSONL session log

**Done when:** after the conversation the file exists and contains properly formatted lines.

---

## Phase 2 – Profile Core

- `user_profile.yaml` load/save
- CLI tool for manual editing
- minimal defaults

**Done when:** you can change `tone: direct` and see that the injection changes.

---

## Phase 3 – Summarization Loop (UI-level)

- Manual button “Summarize session”
- Extension creates hidden GPT thread
- Sends `PROMPT_SUMMARY` + session text
- Parses YAML and sends to daemon
- Daemon merges into profile

**Done when:** after summarization the profile gains topics from the conversation.

---

## Phase 4 – Prompt Injection

- Before sending user message, extension requests injection from daemon
- Daemon generates string according to `PROMPT_DESIGN`
- Extension prepends in textarea
- Preview can be ON/OFF

**Done when:** GPT starts responding in a noticeably different style.

---

## Phase 5 – UI / Control

- Popup: status (ON/OFF), Summarize, Profile preview
- Edit fields (tone, verbosity)
- Export / Import (download/upload YAML)

---

## Phase 6 – Polish / Demo

- Record 2 demo scenarios: before/after personalization; longer usage
- Add README gif
- Prepare short presentation (pitch)

---

## Stretch (not for MVP)

- Automatic periodic summarization
- MTM embeddings + topical activation
- Multi-model support (Claude, local LLM)
- Conflict detection UI (profile vs new signal)
