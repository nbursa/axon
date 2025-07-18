# Axon User Profile Schema (YAML)

## Example

```yaml
user_id: nenad_bursac
created: 2025-07-18
last_updated: 2025-07-18

preferences:
  tone: direct            # direct | neutral | supportive | Socratic
  verbosity: low          # low | medium | high
  technical_depth: high   # low | medium | high
  emotional_resonance: true
  preferred_formats: [plain_text, code, table]

dislikes:
  - fluff
  - assumptions
  - long explanations

topics:
  synthetic_memory: strong
  consciousness_models: strong
  go_backend: strong
  rust_ml: medium
  neurotech: medium
  physics_gqp: weak

blindspots:
  - overabstraction
  - recursive rumination
  - burnout_frustration

knowledge_map:
  ai_memory_systems: expert
  frontend_dev: expert
  llm_internals: intermediate
  quantum_pressure: author
  finance: low

rules:
  challenge_user_errors: true
  truth_first: true
  ask_before_assuming: true

injection_limits:
  max_chars: 1200
  max_tokens: 900
  min_priority: medium
```

---

Fields

| Field             | Type               | Description                  | Update Strategy                                              |
|-------------------|--------------------|------------------------------|--------------------------------------------------------------|
| `preferences`     | map                | Interaction style            | Overwrite with last confirmed signal                         |
| `dislikes`        | list               | What to avoid                | Set union + aging                                            |
| `topics`          | map{topic: weight} | Topic frequency              | Decay + reinforcement                                        |
| `blindspots`      | list               | Cognitive risks              | Add when GPT detects patterns                                |
| `knowledge_map`   | map                | Expertise level              | Manual + inferred from conversations                         |
| `rules`           | map                | Behavioral flags             | Do not change automatically without user confirmation        |
| `injection_limits`| map                | Token/char control           | User configuration                                           |

---

Merge Algorithm (pseudocode)

```go
func MergeProfile(old, new Profile) Profile {
    p := old

    // prefs override if new non-empty
    if new.Preferences != nil { p.Preferences = new.Preferences }

    // topics reinforcement
    for t, w := range new.Topics {
        p.Topics[t] = min(maxTopicWeight, p.Topics[t]+w) // additive clamp
    }

    // dislikes union
    p.Dislikes = dedupe(append(p.Dislikes, new.Dislikes...))

    // blindspots union w/ evidence counters
    p.Blindspots = mergeBlindspots(p.Blindspots, new.Blindspots)

    p.LastUpdated = now()
    return p
}
```

⸻

Size Control
 • Drop topics weight < epsilon during GC cycle.
 • Trim dislikes > 100.
 • Compress history reference into external file.

⸻

Validation

YAML must validate against JSON Schema (profile.schema.json TBD).

---
