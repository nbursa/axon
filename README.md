# Axon Companion (Working Name)

**Lokalni memorijski sloj koji personalizuje tvoju ChatGPT interakciju — bez API-ja.**

Axon je browser + lokalni daemon sistem koji:

- čuva tvoje GPT sesije lokalno,
- periodično ih sažima kroz automatizovan GPT upit u pozadini (UI-level, ne API),
- destiluje dugoročni korisnički profil (stil, preferencije, interesne oblasti, blindspot-i),
- automatski ubacuje personalizovani kontekst u ChatGPT pre svake poruke,
- omogućava ti uvid i kontrolu nad memorijom (transparencija).

Cilj: **AI koji te zaista pamti i radi sa tobom kao kognitivni partner.**  
Use case: demonstracija tehničke sposobnosti, istraživački alat, lični produktivni layer. Nije komercijalni proizvod (MVP faza).

---

## Status

**Phase: Pre-MVP Design / Implementation.**  
Zero-API enforced: sve interakcije sa GPT rade kroz web UI (content script automation).

---

## Visoke vrednosti

- Lokalna privatnost: ništa ne napušta tvoj računar.
- Transparentna memorija: YAML profil koji možeš menjati.
- Adaptivna injekcija: koncizan, kontekstualno relevantan prompt, bez balasta.
- Model-agnostično: primarno za ChatGPT, ali arhitektura dozvoljava Claude / lokalne LLM-ove.

---

## Brzi prikaz rada
Korisnik ↔ ChatGPT UI
↑ (content script intercepter)
│  snimi input/output
│  injektuj personalizaciju
└──▶ Axon Go Daemon (lokalno)
├─ log sesije
├─ povremeno traži GPT da sumira istoriju (skriven prompt)
├─ update user_profile.yaml
└─ šalje nazad kompaktan kontekst za naredne poruke

---

## Core Features (MVP Scope)

- [ ] Captura ChatGPT poruka (user + assistant).
- [ ] Lokalni log sesije.
- [ ] Manualno pokretanje „Summarize session“ (auto kasnije).
- [ ] GPT summary → strukturisani YAML update (preferencije, teme, stil).
- [ ] Prompt injekcija iz YAML + trenutni input.
- [ ] Extension popup: prikaz aktivne memorije + ON/OFF personalizacija.
- [ ] Export / import profila.

---

## Quick Start (dev)

1. `git clone ...`
2. `cd axon-companion`
3. `go mod tidy`
4. `go run ./cmd/axond` (pokreće lokalni WebSocket server)
5. U Chrome: load unpacked extension iz `web/extension/`
6. Otvori ChatGPT → napiši nešto → proveri da li se loguje u `storage/sessions/`
7. Klikni „Summarize & Update“ u popup-u → proveri `storage/profiles/<user>.yaml`
8. Uključi „Inject Memory“ → šalji naredna pitanja GPT-ju i posmatraj promenu ponašanja.

---

## Repo Layout
cmd/axond/           # Go daemon entry
internal/memory/     # STM/MTM/LTM, YAML profil
internal/prompt/     # Prompt builder + token budgeting
internal/server/     # WebSocket / control API
web/extension/       # Browser ekstenzija (content + popup)
storage/             # Lokalni podaci (gitignore)
docs/                # Arhitektura, roadmap, schema

---

## License

TBD (preporuka: Apache-2.0 ili AGPL za defanzivnost).

---

## Credits

Core concept: stratifikovana memorija (SynthaMind).  
MVP implementacija: @Nenad + AI asistencija.
