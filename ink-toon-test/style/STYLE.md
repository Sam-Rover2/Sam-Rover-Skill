# Ink Diorama Toon · 墨线微缩卡通 — Style Prompt

Made from a blank page; techniques from Memphis Diorama (memphis-diorama) in Lemo-Opuscar.
Default size: 1080×1920.

> A narrated, vertical 3D cartoon explainer: every shot is a small, bright diorama built for that framing, with white-headed stick-limbed characters standing large in the frame, ink lines on every edge, a printed grain and a deep violet vignette, and the narration as chunky white captions just under the middle.
> References (grammar only): the user's three reference films (narrated vertical 3D toon explainers: a house, a pirate ship, an office). Use none of their characters, stories, props or layouts.

## 1. Essence, and what it is not

- **A story told by a narrator**, one idea per shot, 2–4 s per shot, cut on the phrase.
- **Dioramas, not worlds**: each shot is a room corner or a piece of street built for its framing (floor, one or two walls, 3–8 props with legible words on them). Nothing is built that the camera does not see.
- **Characters large in the frame**: a third to a half of the height; faces read at phone size.
- **Ink on every edge** (silhouette and inner edges), flat cel shading in three tones, saturated colour, coloured light.

Not a Memphis diorama (that one never shows people; this one is about them). Not flat 2D (real perspective, wide lenses, light in the room). Not photoreal (no depth of field, no glossy reflections).

## 2. Materials & rendering

- **Cel shading, three tones** (toon ramp); hard edges between tones.
- **Ink outline as a post pass** from normals and depth, ~2.3 px at 1080 px width, near-black violet `#1D1830`; plus an inverted-hull silhouette on characters and hero props (heads ~7 px).
- **Printed surface**: soft paper mottling (±3 %) and a fine grain that boils at 12 fps.
- **Vignette**: deep violet (`#4A3A8C` multiply) from ~26 % of the frame radius, strong in the corners.
- **Detail is built and labelled**: signs, posters, ledgers, crates with words (period-correct French/Vietnamese for this film).
- **Characters**: big white sphere head with a thick outline, no ears or nose; eyes are dots, rings or half-lidded lines with stroke brows; mouth a line, smile, teeth or "o"; pill body in the costume colour; long thin dark limbs with round white hands; the costume and one accessory tell who they are. Hands never enter the head or the body.
- **Never**: depth of field, bloom, motion blur, photographic textures.

## 3. Colour logic

- One dominant wall/floor colour per set, saturated (mint wallpaper, yellow plaster, cobalt brick, orange sunset) and one contrasting accent (red poster, gold coins).
- **Mood by light colour**: day warm white, office warm amber, sewer teal with warm lanterns, night cobalt-violet with one warm lamp, sunset orange.
- Ink and the white of the heads never change.

## 4. Type & subtitles

- **Captions**: Nunito Black ~76 px, white, ~13 px dark outline + a short drop shadow, centred at ~66 % of the height, **1–3 words per chunk** (≤ 16 letters, break after punctuation), a small pop (scale 0.85→1) on each chunk.
- In-world type (signs, posters, ledgers) is the only other text; no title cards, no stamps.

## 5. Motion quality

- 30 fps preview, smooth eased motion (no stop-motion), characters act with simple, clear poses timed to the key word: walk, point, recoil, cheer, panic.
- Idle life: breathing (±3 cm), small hand moves. Props fall with gravity, coins spin.
- Hands stay outside the head and body; raised arms go out to the side.

## 6. Camera grammar

| Move | What it expresses | Can serve |
|---|---|---|
| Slow push-in (≈10 % over the shot) | attention | almost every shot |
| Low wide angle close to a character | importance, comedy | a boss, a triumph |
| Insert of a labelled prop | the fact itself | a sign, a coin, a ledger, a tail |
| Over-the-shoulder | an exchange | handing over, a deal |
| High view | a crowd, a place | "the city full of rats" |
| Pull-back reveal | scale | "a massive sewer" |

Hard cuts on the phrase; no dissolves, whips or flashes. The camera never passes through anything.

## 7. Sound palette

Voice-over carries the film; captions follow it word for word. (This film: the user's own voice track.)

## 8. Native moves

- **Labelled insert**: a prop with readable words fills the frame on its key word.
- **Reaction on the word**: the pose changes exactly on the word that names it.
- **Diorama per shot**: the set is rebuilt for every framing.

## 9. Pitfalls of the medium

| Pitfall | Fix |
|---|---|
| Characters small in big sets | build only what the frame sees; characters ⅓–½ of the height |
| Beige, grey look | saturated wall colour + coloured light |
| Arms through the head or body | the rig keeps hands outside (safeHand); raised arms to the side |
| Camera inside a character | check start, middle and end of every shot |
| Empty frame in a crowd shot | spread moving crowds evenly, wrap them |
| Over-directed camera | slow push-ins; no flying, spinning, shaking |

## 10. Engine

Remotion + @react-three/fiber: `films/hanoi-rats/src/movie/InkPass.tsx` (colour + normal/depth passes, ink composite, grain, vignette; adapted from `$LIB/styles/memphis-diorama/demo/memphis.js`), `src/movie/kit.tsx` (Shot, light presets, set pieces), `src/movie/Captions2.tsx`, characters in `src/rig/Person.tsx`.

## 11. Variation space

Story, sets, cast, palette per set, pacing and shot list are free in every film.
