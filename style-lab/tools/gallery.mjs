// Builds catalog/gallery.html: characters, buildings, detail levels, render styles (images embedded).
import fs from 'node:fs';
import { DESIGNS } from '../out/designs.mjs';
import { STYLES } from '../out/styles.mjs';

const img = (p) => `data:image/jpeg;base64,${fs.readFileSync(p).toString('base64')}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const M = 2.2;
const height = (d) => d.leg + d.bodyH + (d.neck ?? 0) + d.head[1] * 1.9;
const card = (src, num, code, name, sub, desc, rows) => `
  <article class="card" id="${code}">
    <img src="${src}" alt="${esc(name)}" loading="lazy">
    <div class="body">
      <div class="num">${num} · <code>${code}</code></div>
      <h3>${esc(name)}${sub ? ` <span>${esc(sub)}</span>` : ''}</h3>
      <p>${esc(desc)}</p>
      <dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    </div>
  </article>`;

const chars = DESIGNS.map((d, i) =>
  card(img(`out/c/char-${d.id}.jpg`), String(i + 1).padStart(2, '0'), d.id, d.name, '', d.desc, [
    ['Рост', `≈ ${(height(d.d) / M).toFixed(2)} м`],
    ['Голова / тело', `${d.d.headShape ?? 'round'} / ${d.d.body ?? 'pill'}`],
    ['Глаза, кисти, обувь', `${d.d.eyes ?? 'dot'}, ${d.d.hands ?? 'ball'}, ${d.d.feet ?? 'shoe'}`],
    ['Подходит для', d.bestFor],
    ['Близко в Lemo-Opuscar', d.lemo],
  ]),
).join('');

const BLD = [
  ['townhouse', 'Кирпичный городской дом', '4 этажа по 3 м, карнизы, подоконники, кондиционеры, ящики с цветами, витрина и маркиза на первом этаже.', 'Улицы, дворы, жилые кварталы'],
  ['skyscraper', 'Стеклянный небоскрёб', '14 этажей (≈ 42 м), сетка навесного фасада, светлое лобби, корона и шпиль. Человек внизу показывает реальный масштаб.', 'Деловой центр, корпорации, панорамы города'],
  ['cottage', 'Коттедж', 'Двускатная крыша, мансардное окно, труба, ставни, белый забор, клумбы.', 'Пригород, семейные истории, сказки'],
  ['cafe', 'Кафе на углу', 'Двухэтажный дом, вывеска с чашкой, маркиза, уличные столики с зонтами.', 'Встречи, свидания, бытовые сцены'],
  ['factory', 'Фабрика', 'Пилообразная крыша с окнами, кирпичные трубы, рольставня, длинный низкий корпус.', 'Производство, индустриальные темы'],
  ['parisian', 'Парижский дом', 'Каменный фасад, мансардная крыша со слуховыми окнами, кованые балконы.', 'Европейский город, романтика, путешествия'],
];
const blds = BLD.map(([id, name, desc, best], i) =>
  card(img(`out/c/bld-${id}.jpg`), String(i + 1).padStart(2, '0'), id, name, '', desc, [['Подходит для', best]]),
).join('');

const LVL = [
  ['Уровень 1: блоки', 'Коробка и плоские прямоугольники окон и двери. Для дальних планов и быстрых черновиков.', 'Самый быстрый'],
  ['Уровень 2: стандарт', 'Наш обычный уровень: рамы, подоконники, карнизы, кондиционеры, цветы на окнах.', 'Быстрый'],
  ['Уровень 3: богатый', 'Плюс кирпичная кладка, водосток, фонари, вывеска, крыльцо, растения, велосипед. Для крупных планов.', 'Средний'],
];
const lvls = LVL.map(([name, desc, cost], i) => card(img(`out/c/detail-${i + 1}.jpg`), `L${i + 1}`, `detail-${i + 1}`, name, '', desc, [['Рендер', cost]])).join('');

const styles = STYLES.map((s, i) =>
  card(img(`out/${s.r.id}.jpg`), String(i + 1).padStart(2, '0'), `style-${s.r.id}`, s.name, s.nameEn, s.desc, [['Подходит для', s.bestFor]]),
).join('');

const nav = (items) => items.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join('');

const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Каталог персонажей</title>
<style>
:root{--bg:#f6f3ee;--fg:#1b1b1f;--muted:#6b6660;--card:#fff;--line:#e4ded4;--accent:#e0573f}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#15161a;--fg:#ecebe8;--muted:#a19c95;--card:#1f2026;--line:#2e3038;--accent:#ff7a5c}}
:root[data-theme=dark]{--bg:#15161a;--fg:#ecebe8;--muted:#a19c95;--card:#1f2026;--line:#2e3038;--accent:#ff7a5c}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,sans-serif}
.wrap{max-width:1240px;margin:0 auto;padding:0 16px}
header{padding-top:40px}h1{font-size:clamp(28px,5vw,44px);margin:0 0 8px}
h2{font-size:clamp(22px,3.5vw,30px);margin:48px 0 6px;scroll-margin-top:16px}
.lead{color:var(--muted);max-width:780px}
nav{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 8px}
nav a{border:1px solid var(--line);border-radius:999px;padding:4px 12px;color:var(--fg);text-decoration:none;font-size:14px;background:var(--card)}
nav a:hover{border-color:var(--accent)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px;margin-top:16px}
@media (max-width:420px){.grid{grid-template-columns:1fr}}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;scroll-margin-top:16px}
.card img,.hero img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;cursor:zoom-in}
.hero{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;margin-top:16px}
.hero p{padding:10px 16px;margin:0;color:var(--muted);font-size:14px}
.body{padding:14px 16px 18px}.num{color:var(--muted);font-size:13px}
h3{margin:4px 0 6px;font-size:20px}h3 span{color:var(--muted);font-weight:500;font-size:15px}
dl{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;margin:10px 0 0;font-size:14px}dt{color:var(--muted)}dd{margin:0}
code{font-size:12px}
.box{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 20px;margin:12px 0}
.box li{margin:4px 0}
footer{height:60px}
dialog{border:0;padding:0;background:transparent;max-width:96vw}dialog img{max-width:96vw;max-height:90vh;border-radius:8px}
dialog::backdrop{background:rgba(0,0,0,.8)}
</style></head><body><div class="wrap">
<header>
<h1>Каталог персонажей и зданий</h1>
<p class="lead">Что мы умеем строить в нашем стеке (Three.js + Remotion). Все персонажи собраны одним конструктором <code>Figure</code> на одном Безье-риге, поэтому любой из них умеет ходить, сидеть, держать предметы и играть эмоции. Можно смешивать черты: например, взять пропорции «взрослого», глаза «чиби» и уши «кота». Нажмите на картинку, чтобы увеличить.</p>
<nav>${nav([['chars', 'Персонажи'], ['buildings', 'Здания'], ['detail', 'Детализация'], ['models', 'Свои 3D-модели'], ['render', 'Стили отрисовки']])}</nav>
</header>

<h2 id="chars">Мультяшные персонажи · ${DESIGNS.length} типов</h2>
<p class="lead">Общий ряд на одной сцене: видна разница в росте. Линии сетки идут через каждые 0.5 м.</p>
<div class="hero"><img src="${img('out/c/lineup.jpg')}" alt="Все персонажи в ряд"><p>Слева направо: ${DESIGNS.map((d) => esc(d.name)).join(' · ')}</p></div>
<div class="grid">${chars}</div>
<div class="box"><b>Что настраивается у персонажа</b><ul>
<li><b>Пропорции:</b> длина ног, высота и ширина тела, шея, размер головы (от чиби до «взрослого»).</li>
<li><b>Форма:</b> голова круглая, кубическая или грушевидная; тело-пилюля, куб, груша или торс с брюками/юбкой.</li>
<li><b>Лицо:</b> глаза (точки, «пирожки», аниме, экран, сонные, циклоп), нос (нет, шарик, мордочка, клюв), рот, румянец, брови.</li>
<li><b>Голова:</b> уши (человек, медведь, кот, заяц, антенна), причёски (шапочка, каре, ёжик, пучок, ирокез, кудри, бакенбарды), шапки (цилиндр, бини, поварской колпак, рожки, корона), очки, усы, борода.</li>
<li><b>Конечности:</b> палочки или трубки в цвет одежды; кисти (шарик, варежка, перчатка, лапа, клешня); обувь (ботинки, большие башмаки, лапы, сапоги).</li>
<li><b>Одежда и детали:</b> V-вырез, галстук, пуговицы, фартук, плащ, шарф, юбка, панель робота, животик, хвост; предметы: трость, книга, телефон, шарик.</li>
</ul></div>

<h2 id="buildings">Здания · ${BLD.length} типов</h2>
<p class="lead">Все в реальном масштабе (этаж 3 м). Рядом стоит наш герой ростом ≈ 1.7 м для сравнения.</p>
<div class="grid">${blds}</div>

<h2 id="detail">Уровни детализации</h2>
<p class="lead">Один и тот же дом на трёх уровнях. Для дальних планов хватает L1, для средних L2, для крупных L3. Так фильм рендерится быстрее без потери качества в кадре.</p>
<div class="grid">${lvls}</div>

<h2 id="models">Свои 3D-модели</h2>
<div class="box"><ul>
<li><b>Форматы:</b> лучше всего GLB/GLTF. FBX и OBJ можно сконвертировать в GLB в бесплатном Blender.</li>
<li><b>В наш стиль:</b> материалы модели заменяются нашими: контур, мультяшная заливка, палитра. Модель встанет рядом с персонажами каталога и не будет выбиваться.</li>
<li><b>Анимация:</b> если у модели есть скелет, работают её кости и готовые движения, например бесплатные из Mixamo. Без скелета модель двигается целиком или по частям.</li>
<li><b>Переделка:</b> цвета, пропорции (крупнее голова, короче ноги), добавить лицо, глаза, аксессуары из конструктора. Сложную перелепку формы лучше делать в Blender.</li>
<li><b>Где брать бесплатно:</b> Sketchfab (CC), Poly Pizza, Kenney, Quaternius, Mixamo. Проверяйте лицензию.</li>
</ul></div>

<h2 id="render">Стили отрисовки · ${STYLES.length}</h2>
<p class="lead">Отдельная ось: <i>как</i> рисуется кадр. Любой персонаж и здание выше можно показать в любом из этих стилей.</p>
<div class="grid">${styles}</div>
<footer></footer>
</div>
<dialog id="d" onclick="this.close()"><img id="di" alt=""></dialog>
<script>
document.querySelectorAll('.card img,.hero img').forEach(i=>i.addEventListener('click',()=>{const d=document.getElementById('d');document.getElementById('di').src=i.src;d.showModal()}));
</script>
</body></html>`;
fs.writeFileSync('catalog/gallery.html', html);
console.log('catalog/gallery.html', (html.length / 1e6).toFixed(1), 'MB');
