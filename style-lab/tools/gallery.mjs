// Builds out/gallery.html: one self-contained page with every style (images embedded).
import fs from 'node:fs';
import { STYLES } from '../out/styles.mjs';

const img = (id) => `data:image/jpeg;base64,${fs.readFileSync(`out/${id}.jpg`).toString('base64')}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const cards = STYLES.map(
  (s, i) => `
  <article class="card" id="${s.r.id}">
    <img src="${img(s.r.id)}" alt="${esc(s.name)}" loading="lazy">
    <div class="body">
      <div class="num">${String(i + 1).padStart(2, '0')} · <code>${s.r.id}</code></div>
      <h2>${esc(s.name)} <span>${esc(s.nameEn)}</span></h2>
      <p>${esc(s.desc)}</p>
      <dl>
        <dt>Подходит для</dt><dd>${esc(s.bestFor)}</dd>
        <dt>Близкие стили Lemo-Opuscar</dt><dd>${esc(s.lemo)}</dd>
        <dt>Рендер</dt><dd>${esc(s.cost)}</dd>
      </dl>
    </div>
  </article>`,
).join('');

const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Каталог стилей</title>
<style>
:root{--bg:#f6f3ee;--fg:#1b1b1f;--muted:#6b6660;--card:#fff;--line:#e4ded4;--accent:#e0573f}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#15161a;--fg:#ecebe8;--muted:#a19c95;--card:#1f2026;--line:#2e3038;--accent:#ff7a5c}}
:root[data-theme=dark]{--bg:#15161a;--fg:#ecebe8;--muted:#a19c95;--card:#1f2026;--line:#2e3038;--accent:#ff7a5c}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,sans-serif}
header,main,section{max-width:1240px;margin:0 auto;padding:0 16px}
header{padding-top:40px}h1{font-size:clamp(28px,5vw,44px);margin:0 0 8px}
.lead{color:var(--muted);max-width:760px}
nav{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 28px}
nav a{border:1px solid var(--line);border-radius:999px;padding:4px 12px;color:var(--fg);text-decoration:none;font-size:14px;background:var(--card)}
nav a:hover{border-color:var(--accent)}
main{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:20px}
@media (max-width:420px){main{grid-template-columns:1fr}}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.card img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;cursor:zoom-in}
.body{padding:14px 16px 18px}.num{color:var(--muted);font-size:13px}
h2{margin:4px 0 6px;font-size:20px}h2 span{color:var(--muted);font-weight:500;font-size:15px}
dl{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;margin:10px 0 0;font-size:14px}dt{color:var(--muted)}dd{margin:0}
code{font-size:12px}
section.info{margin-top:40px;padding-bottom:60px}
.info h2{font-size:24px}.info li{margin:4px 0}
.box{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 20px;margin:12px 0}
dialog{border:0;padding:0;background:transparent;max-width:96vw}dialog img{max-width:96vw;max-height:90vh;border-radius:8px}
dialog::backdrop{background:rgba(0,0,0,.8)}
</style></head><body>
<header>
<h1>Каталог стилей персонажей</h1>
<p class="lead">Одна и та же сцена — Макс и Лена у дома — отрисована в ${STYLES.length} стилях. Всё сделано одним стеком: Three.js и Remotion. Персонажи, риг и анимации общие, меняются только материалы, линии и «плёнка» поверх кадра. Поэтому любой стиль можно применить к любому нашему фильму. Нажмите на картинку, чтобы увеличить.</p>
<nav>${STYLES.map((s) => `<a href="#${s.r.id}">${esc(s.name)}</a>`).join('')}</nav>
</header>
<main>${cards}</main>
<section class="info">
<h2>Свои 3D-модели: что можно сделать</h2>
<div class="box"><ul>
<li><b>Форматы:</b> лучше всего <b>GLB/GLTF</b>. Также подходят FBX и OBJ: их можно сконвертировать в GLB, например в бесплатном Blender.</li>
<li><b>Перекрасить под любой стиль из каталога:</b> да. Материалы модели заменяются на наши (контур, toon, пластилин, неон и т.д.). Модель будет выглядеть как персонажи выше.</li>
<li><b>Анимировать:</b> если у модели есть скелет (риг), используются её кости и готовые анимации, например из бесплатного Mixamo: ходьба, бег, танец. Если скелета нет, можно двигать модель целиком или по частям.</li>
<li><b>Переделать:</b> можно менять цвета, пропорции (например, увеличить голову для мультяшности), добавить наш контур, лицо-«наклейку», аксессуары. Сложную перелепку формы лучше делать в Blender.</li>
<li><b>Где брать бесплатно:</b> Sketchfab (лицензия CC), Poly Pizza, Kenney, Quaternius, Mixamo. Обязательно проверяйте лицензию.</li>
<li><b>Ограничения:</b> очень тяжёлые модели (миллионы полигонов) замедляют рендер. Реалистичные лица в мультяшном стиле смотрятся хуже простых форм.</li>
</ul></div>
<h2>Как выбрать стиль для ролика</h2>
<div class="box">Напишите в задаче название или код стиля, например <code>clay</code> или «пластилин», либо «смешай акварель и скетч». Стили можно комбинировать и создавать новые: менять палитру, толщину линии, текстуру бумаги, свет.</div>
</section>
<dialog id="d" onclick="this.close()"><img id="di" alt=""></dialog>
<script>
document.querySelectorAll('.card img').forEach(i=>i.addEventListener('click',()=>{const d=document.getElementById('d');document.getElementById('di').src=i.src;d.showModal()}));
</script>
</body></html>`;
fs.writeFileSync('out/gallery.html', html);
console.log('out/gallery.html', (html.length / 1e6).toFixed(1), 'MB');
