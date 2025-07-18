# Config Options

| Key | Default | Description |
|-----|---------|-------------|
| `autoSummarize.afterMessages` | 25 | After how many messages to offer summarization |
| `autoSummarize.onSessionEnd` | true | Auto prompt when closing tab |
| `prompt.maxTokens` | 900 | Injection limit |
| `prompt.minSignalWeight` | 0.3 | Threshold for including a topic |
| `privacy.noTelemetry` | true | Never send usage |
| `privacy.anonymizeUserId` | false | Use anonymous ID instead of name |
| `debug.showInjectedPrompt` | true | UI display of injection |
| `debug.logRawDom` | false | Heavy log, dev only |

Config is stored in `storage/config.yaml`.
