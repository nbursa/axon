# Task Checklist (Implementation granular)

## Boot

- [ ] go mod init
- [ ] logger
- [ ] config loader

## WS Server

- [ ] start ws @ :7381
- [ ] accept connections
- [ ] inbound msg router

## Session Logging

- [ ] open jsonl per session
- [ ] append user/assistant events
- [ ] rotate on session close

## Profile Load/Save

- [ ] default load
- [ ] write on update
- [ ] validate schema

## Extension Content Script

- [ ] detect input textarea
- [ ] intercept send click / Enter
- [ ] capture assistant message
- [ ] send over ws

## Summarization Flow

- [ ] popup button -> gather session -> open hidden tab -> send summary prompt -> parse YAML -> ws -> daemon merge

## Prompt Injection

- [ ] ask daemon for injection
- [ ] prepend to textarea
- [ ] optional preview UI

## UI Popup

- [ ] ON/OFF toggle
- [ ] Summarize now
- [ ] Profile view
- [ ] Edit tone/verbosity

## Export/Import

- [ ] download YAML
- [ ] upload + validate + merge
