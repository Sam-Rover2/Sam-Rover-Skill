// Builds catalog/stickman-report.html (images embedded).
import fs from 'node:fs';
const img = (n) => `data:image/jpeg;base64,${fs.readFileSync(`out/s/${n}.jpg`).toString('base64')}`;
const poses = ['Стоит', 'Идёт', 'Бежит', 'Прыжок', 'Испуг «!»', 'Машет', 'Сидит', 'Думает'];
const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Стикмен: отчёт</title>
<style>
:root{--bg:#f2f2f0;--fg:#111;--muted:#666;--card:#fff;--line:#e2e2de}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#141414;--fg:#eee;--muted:#9a9a9a;--card:#1e1e1e;--line:#2c2c2c}}
:root[data-theme=dark]{--bg:#141414;--fg:#eee;--muted:#9a9a9a;--card:#1e1e1e;--line:#2c2c2c}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,sans-serif}
.wrap{max-width:1100px;margin:0 auto;padding:40px 16px 60px}
h1{font-size:clamp(28px,5vw,44px);margin:0 0 6px}h2{margin:40px 0 10px;font-size:24px}
.lead{color:var(--muted);max-width:760px}
figure{margin:16px 0;background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}
figure img{display:block;width:100%;cursor:zoom-in}figcaption{padding:10px 16px;color:var(--muted);font-size:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
.box{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 18px}
.box h3{margin:0 0 6px;font-size:17px}.box p,.box ul{margin:0;font-size:15px}.box li{margin:3px 0}
table{width:100%;border-collapse:collapse;font-size:15px;background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}
td,th{padding:8px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{color:var(--muted);font-weight:600}
code{font-size:13px;background:rgba(127,127,127,.15);padding:1px 5px;border-radius:4px}
pre{background:#111;color:#eee;padding:14px;border-radius:10px;overflow:auto;font-size:13px}
dialog{border:0;padding:0;background:transparent;max-width:96vw}dialog img{max-width:96vw;max-height:90vh}dialog::backdrop{background:rgba(0,0,0,.85)}
</style></head><body><div class="wrap">
<h1>Стикмен в стиле чернильной кисти</h1>
<p class="lead">Сцена и персонажи сделаны в Three.js и рендерятся через Remotion. Из референса взят только стиль. Сцена простая: верёвочный мост над обрывом, дерево, солнце, птицы и три персонажа.</p>

<h2>Результат</h2>
<figure><img src="${img('stick-scene')}" alt="Общая сцена"><figcaption>Общий план: друг машет с левого обрыва, герой на мосту испугался, третий сидит на краю справа.</figcaption></figure>
<figure><img src="${img('stick-close')}" alt="Крупный план"><figcaption>Крупный план: мост из мазков, линии акцента «!», голова в чернильном кольце.</figcaption></figure>
<figure><img src="${img('stick-poses')}" alt="Позы"><figcaption>8 готовых поз: ${poses.join(' · ')}.</figcaption></figure>

<h2>Что взято из референса</h2>
<div class="grid">
<div class="box"><h3>Монохромная тушь</h3><p>Только чистый чёрный (#0b0b0b) и белый. Объекты без объёма, читаются как силуэты.</p></div>
<div class="box"><h3>Мазок кистью</h3><p>Ширина меняется: тонкое начало, плотное тело, сухой «рваный» хвост с 2–3 щетинками. Края слегка неровные, как у настоящей кисти.</p></div>
<div class="box"><h3>Голова</h3><p>Белый шар с мягкой тенью внутри толстого чёрного кольца (≈ 22% радиуса). Лица нет, эмоцию передают поза и знаки.</p></div>
<div class="box"><h3>Тело-палочка</h3><p>Прямая толстая линия торса, руки и ноги той же толщины, концы скруглены. Локти и колени гнутся.</p></div>
<div class="box"><h3>Знаки эмоций</h3><p>Линии акцента «!» над головой: три клина с точками, как в манге.</p></div>
<div class="box"><h3>Фон</h3><p>Светло-серая «бумага» с мягким радиальным градиентом и виньеткой.</p></div>
</div>

<h2>Из чего собрано</h2>
<table>
<tr><th>Компонент</th><th>Что делает</th></tr>
<tr><td><code>Brush</code></td><td>Чернильный мазок по кривой: ширина, сужение концов, шероховатость, сухие щетинки. Из него сделано всё окружение.</td></tr>
<tr><td><code>Stick</code></td><td>Персонаж-палочник на Безье-риге: позиция таза, наклон торса, цели кистей и стоп, направление локтей и коленей, наклон головы, знак «!».</td></tr>
<tr><td><code>STICK_POSES</code></td><td>Библиотека поз: стоит, идёт, бежит, прыжок, испуг, машет, сидит, думает. Позы смешиваются, их легко анимировать.</td></tr>
<tr><td><code>Post</code>, <code>Rope</code></td><td>Столб с рваным низом и провисающая верёвка (провис задаётся числом).</td></tr>
<tr><td>Сцена</td><td>Обрывы со штриховкой, мост из 11 досок, дерево из 4 мазков, солнце-кольцо, птицы-«галочки».</td></tr>
</table>

<h2>Что можно дальше</h2>
<div class="box"><ul>
<li>Анимация: ходьба по мосту, раскачивание моста и верёвок, появление «!» с отскоком, бег, прыжки.</li>
<li>Типы стикменов: шляпа, сумка, рост и толщина линии, ребёнок и взрослый, животные из мазков.</li>
<li>Новые декорации из той же кисти: дома, горы, вода, дождь, город.</li>
<li>Акцент цветом: например, один красный предмет на чёрно-белой сцене.</li>
</ul></div>

<h2>Как открыть у себя</h2>
<p>Код лежит в <code>style-lab/src/stick/</code>. В папке <code>style-lab</code>:</p>
<pre>npm install
npx remotion still src/index.ts stick-scene out/stick-scene.png</pre>
<p class="lead">Другие кадры: <code>stick-close</code>, <code>stick-poses</code>. Для живого просмотра: <code>npx remotion studio src/index.ts</code>.</p>
</div>
<dialog id="d" onclick="this.close()"><img id="di" alt=""></dialog>
<script>document.querySelectorAll('figure img').forEach(i=>i.addEventListener('click',()=>{document.getElementById('di').src=i.src;document.getElementById('d').showModal()}));</script>
</body></html>`;
fs.writeFileSync('catalog/stickman-report.html', html);
console.log('ok', (html.length / 1e6).toFixed(1), 'MB');
