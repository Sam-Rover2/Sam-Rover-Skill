# Лаборатория: персонажи, здания, стили

Каталог `catalog/gallery.html`: 13 типов персонажей (конструктор `src/rig/Figure.tsx`), 6 зданий и 3 уровня детализации (`src/props/Buildings.tsx`), 13 стилей отрисовки.
Картинки: `catalog/characters-sheet.png`, `catalog/characters-lineup.png`, `catalog/buildings-sheet.png`, `catalog/all-styles.png`.

Карточки рендерятся так: `npx remotion still src/index.ts char-robot out/robot.png` (также `lineup`, `bld-cottage`, `detail-3`).

Одна сцена (Макс и Лена у дома) отрисована в 13 стилях. Готовый каталог: `catalog/gallery.html`. Откройте его двойным кликом.

Стили описаны в `src/styles.ts`, материалы переключаются в `src/lib/materials.ts`.

Пересобрать картинки у себя:

```bash
npm install
```

```bash
npx remotion still src/index.ts style-clay out/clay.png
```

(`style-<код>`: toon, cel2, clay, vinyl, lowpoly, lineart, sketch, watercolor, riso, blueprint, neon, pixel, noir)
