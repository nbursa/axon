package memory

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"time"

	"gopkg.in/yaml.v3"
)

// Profile is a "loose" structure compatible with future extensions.
// Known sections are explicitly modeled, and the rest goes to Extra (inline).
type Profile struct {
	Identity    map[string]any   `yaml:"identity,omitempty"`
	Style       map[string]any   `yaml:"style,omitempty"`
	Preferences map[string]any   `yaml:"preferences,omitempty"`
	Topics      map[string]any   `yaml:"topics,omitempty"`
	Rules       map[string]any   `yaml:"rules,omitempty"`
	History     []map[string]any `yaml:"history,omitempty"` // opciono: log sirovih fragmenata
	Extra       map[string]any   `yaml:",inline"`           // nepoznati top-level ključevi
}

// LoadProfile loads YAML from the DefaultProfile path.
// If the file does not exist, it returns the default profile without error.
func LoadProfile() (*Profile, error) {
	p := &Profile{}

	if err := os.MkdirAll(ProfileDir, 0o755); err != nil {
		return nil, err
	}

	b, err := os.ReadFile(DefaultProfile)
	if err != nil {
		if errors.Is(err, fs.ErrNotExist) {
			return defaultProfile(), nil
		}
		return nil, err
	}
	if len(b) == 0 {
		return defaultProfile(), nil
	}
	if err := yaml.Unmarshal(b, p); err != nil {
		return nil, err
	}
	return p, nil
}

// SaveProfile saves YAML to the DefaultProfile path.
func SaveProfile(p *Profile) error {
	if p == nil {
		return fmt.Errorf("nil profile")
	}
	if err := os.MkdirAll(filepath.Dir(DefaultProfile), 0o755); err != nil {
		return err
	}
	b, err := yaml.Marshal(p)
	if err != nil {
		return err
	}
	return os.WriteFile(DefaultProfile, b, 0o644)
}

// ApplySummaryYAML deeply merges a partial YAML fragment
// obtained from the model with the existing profile, and saves the result.
func ApplySummaryYAML(fragment string) (*Profile, error) {
	if fragment == "" {
		return nil, fmt.Errorf("empty YAML summary")
	}
	incoming := map[string]any{}
	if err := yaml.Unmarshal([]byte(fragment), &incoming); err != nil {
		return nil, fmt.Errorf("invalid YAML: %w", err)
	}

	current, err := LoadProfile()
	if err != nil {
		return nil, err
	}

	mergedMap := structToMap(current)
	deepMerge(mergedMap, incoming)

	// write short history
	if current.History == nil {
		current.History = []map[string]any{}
	}
	current.History = append(current.History, map[string]any{
		"ts":   time.Now().Format(time.RFC3339),
		"diff": incoming,
	})

	// re-hydrate back into struct and save
	updated := &Profile{}
	b, err := yaml.Marshal(mergedMap)
	if err != nil {
		return nil, err
	}
	if err := yaml.Unmarshal(b, updated); err != nil {
		return nil, err
	}

	if err := SaveProfile(updated); err != nil {
		return nil, err
	}
	return updated, nil
}

func defaultProfile() *Profile {
	return &Profile{
		Style: map[string]any{"tone": "neutral"},
		Extra: map[string]any{
			"_created": time.Now().Format(time.RFC3339),
		},
	}
}

// --- helpers ---

func structToMap(p *Profile) map[string]any {
	if p == nil {
		return map[string]any{}
	}
	b, _ := yaml.Marshal(p)
	m := map[string]any{}
	_ = yaml.Unmarshal(b, &m)
	return m
}

func deepMerge(dst, src map[string]any) {
	for k, v := range src {
		if v == nil {
			continue
		}
		if dv, ok := dst[k]; ok {
			// map + map -> recurse
			if dm, ok1 := dv.(map[string]any); ok1 {
				if sm, ok2 := toStringAnyMap(v); ok2 {
					deepMerge(dm, sm)
					dst[k] = dm
					continue
				}
			}
			// slice + slice -> append unique
			if ds, ok1 := dv.([]any); ok1 {
				if ss, ok2 := v.([]any); ok2 {
					dst[k] = appendUnique(ds, ss)
					continue
				}
			}
		}
		// default: replace
		dst[k] = v
	}
}

func toStringAnyMap(v any) (map[string]any, bool) {
	if m, ok := v.(map[string]any); ok {
		return m, true
	}
	switch mm := v.(type) {
	case map[interface{}]interface{}:
		res := make(map[string]any, len(mm))
		for k, vv := range mm {
			res[fmt.Sprint(k)] = vv
		}
		return res, true
	default:
		return nil, false
	}
}

func appendUnique(dst, src []any) []any {
	seen := map[string]struct{}{}
	key := func(v any) string { return fmt.Sprintf("%T:%v", v, v) }
	for _, v := range dst {
		seen[key(v)] = struct{}{}
	}
	for _, v := range src {
		if _, ok := seen[key(v)]; !ok {
			dst = append(dst, v)
			seen[key(v)] = struct{}{}
		}
	}
	return dst
}
