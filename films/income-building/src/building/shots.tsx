/**
 * «Здание из 100 работников» — the shot list (13:25). One row = one shot, cut on the phrase
 * (times from voice.srt). Each shot is a template from sets.tsx with its own params.
 */
import { Bars, Board, Door, Duo, Exterior, HostOffice, HouseKey, Lift, Penthouse, Register, Stairs, type Actor, type Bar } from './sets';

export interface ShotDef {
  from: number;
  to: number;
  name: string;
  C: React.FC<{ t: number; k: number }>;
}
export const FILM_SECONDS = 805.4;

const GREEN = '#3f8f73';
const RED = '#c8302c';
const GOLD = '#e0b23e';
const BLUE = '#3a6fb0';
const GREY = '#8a8a9a';
const STEPS = ['$14', '$15', '$27', '$67'];
const RISE = [0.35, 0.42, 0.75, 1.6];
const bar = (label: string, text: string, value: number, color: string, at: number): Bar => ({ label, text, value, color, at });
const who = (id: string, pos: [number, number, number], rotY: number, acts: Actor['acts']): Actor => ({ id, pos, rotY, acts });

type R = [number, number, string, React.FC<{ t: number; k: number }>];
const rows: R[] = [
  /* ---------------- intro ---------------- */
  [0, 6.0, 'Середина: $64 000', (p) => <Exterior {...p} cam="floor" floor={5} sign="$64,000 = THE EXACT MIDDLE" />],
  [6.0, 9.3, 'Середина теряет почву', (p) => <Door {...p} door={50} floor={5} who="door50" lines={['DOOR 50', '!$64,000 / YEAR', 'THIS YEAR: ▼']} at={[6.2, 6.6, 8.3]} acts={[[0, 'still', 'smile'], [8.1, 'think', 'o']]} />],
  [9.3, 11.2, 'Почему?', (p) => <HostOffice {...p} cam={1} acts={[[0, 'think', 'o'], [10.3, 'point', 'smug']]} />],
  [11.2, 20.0, 'Зарплата +1.5%, цены +3.5%', (p) => <Bars {...p} title="Q3 2026" bars={[bar('PAYCHECK', '+1.5%', 0.43, GREEN, 15.6), bar('PRICES', '+3.5%', 1, RED, 18.4)]} who={who('host', [-6.4, 0, -4], 0.5, [[0, 'talk', 'smile'], [18.4, 'shrug', 'o']])} />],
  [20.0, 23.5, 'Прибавка на бумаге', (p) => <Register {...p} display="-2%" receipt={['RAISE ON PAPER', '+1.5%', 'PRICES', '+3.5%', '!PAY CUT']} at={[20.0, 20.6, 21.6, 22.0, 22.6]} acts={[[0, 'still', 'smile'], [22.4, 'shrug', 'o']]} />],
  [23.5, 27.4, 'Это только первый этаж', (p) => <Exterior {...p} cam="wide" floor={1} lift={[1, 10, 26.1, 27.3]} />],
  [27.4, 29.6, 'Я построил здание', (p) => <HostOffice {...p} acts={[[0, 'present', 'grin']]} />],
  [29.6, 33.4, '100 работников, по 10 на этаж', (p) => <HostOffice {...p} cam={2} hi={1} />],
  [33.4, 36.3, 'Внизу меньше всех, наверху больше', (p) => <Exterior {...p} cam="wide" lift={[1, 10, 33.6, 36.1]} />],
  [36.3, 40.0, '5 дверей, 5 чисел, 1 правило', (p) => <Board {...p} lines={['!5 DOORS', '5 REAL NUMBERS', '!1 RULE']} at={[36.5, 37.7, 39.2]} />],
  [40.0, 43.0, 'Нет источника — нет на двери', (p) => <Board {...p} cam={1} lines={['THE RULE:', '!NO SOURCE?', '!NOT ON THE DOOR']} at={[40.2, 40.8, 41.6]} />],
  [43.0, 50.4, 'Лифтёр против выпускника', (p) => <Lift {...p} open={44.5} who={[who('elevator', [0, 0, -7.6], 0, [[0, 'still', 'smile'], [45.5, 'present', 'grin']]), who('grad', [4.8, 0, -5], -0.5, [[0, 'still', 'smile'], [48.3, 'think', 'o']])]} />],
  [50.4, 51.6, 'Покажу чек', (p) => <Register {...p} cam={1} display="$109,910" receipt={['!RECEIPT']} at={[50.5]} />],
  [51.6, 58.0, 'Второй лифт', (p) => <Exterior {...p} cam="wide" rocket={[1, 10, 54.3, 57.5]} sign="WHAT YOU OWN, NOT WHAT YOU EARN" />],
  [58.0, 60.4, 'Не останавливается на тех же этажах', (p) => <Exterior {...p} cam="wide" lift={[1, 3, 58.0, 59.4]} rocket={[10, 7, 58.0, 59.8]} />],
  [60.4, 67.2, 'Тест: сколько из 100 зарабатывают $100k+', (p) => <Board {...p} lines={['!QUIZ', 'OUT OF 100 PEOPLE', 'HOW MANY MAKE', '!$100,000+ ?']} at={[60.6, 63.5, 65.5, 66.4]} acts={[[0, 'think', 'smug']]} />],
  [67.2, 74.1, 'Запомните число', (p) => <HostOffice {...p} cam={1} acts={[[0, 'talk', 'smile'], [69.9, 'point', 'smug']]} board={{ lines: ['!LOCK IN A NUMBER', 'ANSWER AT DOOR 75'], at: [69.9, 71.2] }} />],
  [74.1, 83.2, 'Данные BLS', (p) => <Board {...p} lines={['DATA: BUREAU OF', 'LABOR STATISTICS', 'WEEKLY PAY · FULL-TIME', '!≈ 122 MILLION PEOPLE']} at={[74.8, 75.9, 77.8, 81.0]} />],
  [83.2, 91.8, 'Математика на салфетке', (p) => <Board {...p} napkin lines={['WEEKLY × 52 = YEARLY', 'WEEKLY ÷ 40 = HOURLY', '!NAPKIN MATH']} at={[84.5, 88.0, 90.9]} />],
  [91.8, 95.3, 'Подписано как салфетка', (p) => <HostOffice {...p} cam={1} acts={[[0, 'shrug', 'grin']]} />],
  [95.3, 99.8, 'Медиана, а не среднее', (p) => <Board {...p} lines={['!MEDIAN', '= THE PERSON IN THE MIDDLE', 'NOT THE AVERAGE']} at={[95.6, 96.8, 98.6]} />],
  [99.8, 106.4, 'Среднее тянет пентхаус', (p) => <Penthouse {...p} plates={{ lines: ['AVERAGE: PULLED UP ▲', '!MEDIAN: NOT INVITED'], at: [100.4, 104.0] }} acts={[[0, 'present', 'smug'], [104, 'cheer', 'grin']]} />],
  [106.4, 114.4, 'Кого нет в здании', (p) => <Exterior {...p} cam="ground" sign="FULL-TIME WORKERS ONLY" crowd={[who('young', [-3.2, 0, -2], 0.3, [[0, 'still', 'o'], [108.1, 'shrug', 'o']]), who('retiree', [3.2, 0, -2], -0.3, [[0, 'still', 'smile'], [111.1, 'wave', 'smile']]), who('door25', [0, 0, -3], 0, [[0, 'still', 'smile'], [109.2, 'shrug', 'smug']])]} />],
  [114.4, 116.3, 'Этаж 1. Поехали', (p) => <Exterior {...p} cam="floor" floor={1} />],
  /* ---------------- door 10 ---------------- */
  [116.3, 123.3, 'Дверь 10: угадайте', (p) => <Door {...p} door={10} floor={1} who="door10" open={117} lines={['DOOR 10', 'GUESS: WEEKLY PAY?', '!$634 / WEEK', '≈ $33,000 / YEAR', '≈ $15.85 / HOUR']} at={[116.5, 119.8, 123.4, 127.2, 131.9]} acts={[[0, 'still', 'smile'], [119.8, 'shrug', 'smile']]} />],
  [123.3, 129.0, '$634 в неделю', (p) => <Door {...p} cam={1} door={10} floor={1} who="door10" open={0} lines={['DOOR 10', 'GUESS: WEEKLY PAY?', '!$634 / WEEK', '≈ $33,000 / YEAR', '≈ $15.85 / HOUR']} at={[0, 0, 123.4, 127.2, 131.9]} />],
  [129.0, 134.2, '$15.85 в час', (p) => <Door {...p} cam={2} door={10} floor={1} who="door10" open={0} lines={['DOOR 10', 'GUESS: WEEKLY PAY?', '!$634 / WEEK', '≈ $33,000 / YEAR', '≈ $15.85 / HOUR']} at={[0, 0, 0, 0, 131.9]} acts={[[0, 'talk', 'smile']]} />],
  [134.2, 142.3, 'Все тут работают полный день', (p) => <HostOffice {...p} board={{ lines: ['EVERYONE HERE', '!WORKS FULL-TIME', 'NO PART-TIME', 'NO "BETWEEN JOBS"'], at: [134.3, 136.4, 139.2, 140.5] }} acts={[[0, 'talk', 'smile'], [136.4, 'point', 'smile']]} />],
  [142.3, 150.6, '90 соседей зарабатывают больше', (p) => <Exterior {...p} cam="floor" floor={1} sign="90 OF 100 OUT-EARN DOOR 10" />],
  /* ---------------- door 25 ---------------- */
  [150.6, 156.1, 'Дверь 25: угадайте снова', (p) => <Door {...p} door={25} floor={3} who="door25" open={151} lines={['DOOR 25', 'GUESS AGAIN', '!$849 / WEEK', '≈ $44,000 / YEAR', '≈ $21 / HOUR']} at={[150.7, 152.9, 154.4, 156.2, 158.8]} acts={[[0, 'still', 'smile'], [154.4, 'present', 'grin']]} />],
  [156.1, 161.3, '$44 000 в год', (p) => <Door {...p} cam={1} door={25} floor={3} who="door25" open={0} lines={['DOOR 25', 'GUESS AGAIN', '!$849 / WEEK', '≈ $44,000 / YEAR', '≈ $21 / HOUR']} at={[0, 0, 0, 156.2, 158.8]} />],
  [161.3, 174.2, 'Лестница: $14 за ступеньку', (p) => <Stairs {...p} labels={STEPS} heights={RISE} hi={0} step={[0, 5, 163, 170]} acts={[[0, 'still', 'smile'], [170.5, 'point', 'smile']]} />],
  [174.2, 178.1, 'Лестница станет круче', (p) => <Stairs {...p} labels={STEPS} heights={RISE} hi={3} step={[5, 5, 0, 1]} acts={[[0, 'point', 'o']]} />],
  [178.1, 185.4, 'Ориентир: без аттестата $819', (p) => <Board {...p} lines={['LANDMARK', 'NO HIGH SCHOOL DIPLOMA', '!$819 / WEEK']} at={[178.3, 179.8, 183.0]} />],
  [185.4, 188.6, 'Между дверями 10 и 25', (p) => <Bars {...p} title="WEEKLY PAY" bars={[bar('DOOR 10', '$634', 0.51, BLUE, 185.5), bar('NO DIPLOMA', '$819', 0.66, GOLD, 186.3), bar('DOOR 25', '$849', 0.69, BLUE, 187.1)]} cam={1} />],
  /* ---------------- door 50 ---------------- */
  [188.6, 193.0, 'Дверь 50 — середина здания', (p) => <Exterior {...p} cam="floor" floor={5} lift={[3, 5, 188.8, 190.8]} />],
  [193.0, 197.6, '$1232 в неделю', (p) => <Door {...p} door={50} floor={5} who="door50" open={193.2} lines={['DOOR 50', '!$1,232 / WEEK', '≈ $64,000 / YEAR', '≈ $30.80 / HOUR']} at={[193.0, 193.1, 195.1, 197.8]} acts={[[0, 'still', 'smile'], [194, 'present', 'grin']]} />],
  [197.6, 200.4, '$30.80 в час', (p) => <Door {...p} cam={2} door={50} floor={5} who="door50" open={0} lines={['DOOR 50', '!$1,232 / WEEK', '≈ $64,000 / YEAR', '≈ $30.80 / HOUR']} at={[0, 0, 0, 197.8]} acts={[[0, 'talk', 'smile']]} />],
  [200.4, 210.8, 'Ещё пологая лестница', (p) => <Stairs {...p} labels={STEPS} heights={RISE} hi={1} step={[5, 10, 201, 206]} acts={[[0, 'still', 'smile'], [209.9, 'shrug', 'smile']]} />],
  [210.8, 220.0, 'Аттестат: $993', (p) => <Bars {...p} title="WEEKLY PAY" bars={[bar('DOOR 25', '$849', 0.43, BLUE, 211.2), bar('HIGH SCHOOL', '$993', 0.5, GOLD, 213.5), bar('DOOR 50', '$1,232', 0.62, BLUE, 217.4)]} />],
  [220.0, 226.0, 'Ответ на главный вопрос', (p) => <HostOffice {...p} acts={[[0, 'talk', 'smile'], [223, 'point', 'smug']]} hi={5} />],
  [226.0, 233.2, 'Год назад $1214, сейчас $1232', (p) => <Door {...p} cam={1} door={50} floor={5} who="door50" open={0} lines={['A YEAR AGO: $1,214', '!TODAY: $1,232', '+ $18 / WEEK']} at={[226.0, 228.0, 231.0]} />],
  [233.2, 240.0, 'Цены +3.5%', (p) => <Register {...p} display="+3.5%" receipt={['PRICES +3.5%', 'SAME BASKET', '!+ $42 / WEEK']} at={[233.4, 236.5, 240.5]} acts={[[0, 'still', 'smile'], [235.9, 'shrug', 'o']]} />],
  [240.0, 247.1, '$18 пришло, $42 ушло', (p) => <Register {...p} cam={1} display="+$42" receipt={['PRICES +3.5%', 'SAME BASKET', '!+ $42 / WEEK', 'PAY: + $18']} at={[0, 0, 240.5, 244.2]} />],
  [247.1, 255.4, 'Минус $24 каждую неделю', (p) => <Bars {...p} title="EVERY WEEK" bars={[bar('PAY IN', '+$18', 0.3, GREEN, 247.3), bar('PRICES OUT', '+$42', 0.7, RED, 247.9), bar('SHORT', '−$24', 0.4, GREY, 248.6)]} who={who('door50', [-6.4, 0, -4], 0.5, [[0, 'still', 'o'], [252, 'shrug', 'o']])} />],
  [255.4, 266.9, 'Реально ≈ −2%', (p) => <Board {...p} napkin lines={['$18 IN · $42 OUT', '= − $24 / WEEK', '≈ − $1,270 / YEAR', '!REAL CHANGE ≈ −2%']} at={[255.5, 257.2, 259.0, 263.5]} />],
  [266.9, 270.8, 'Зарплата вверх, чек — нет', (p) => <Register {...p} cam={1} display="−2%" receipt={['PAYCHECK: ▲', '!RECEIPT: ▼']} at={[267.0, 269.0]} />],
  /* ---------------- objection: households ---------------- */
  [270.8, 282.3, 'Перепись: доход домохозяйства $87 460', (p) => <HouseKey {...p} plates={{ lines: ['CENSUS BUREAU', 'HOUSEHOLD INCOME 2025', '!$87,460', 'A RECORD'], at: [272.8, 274.5, 277.0, 279.0] }} who={[who('door50', [-1.2, 0, -2], 0.2, [[0, 'still', 'smile']]), who('door25', [1.0, 0, -2], -0.2, [[0, 'still', 'smile']])]} />],
  [282.3, 291.0, 'Разные линейки', (p) => <Duo {...p} a={who('door50', [-3.2, 0, -5], 0.15, [[0, 'talk', 'smile']])} b={who('door25', [3.2, 0, -5], -0.15, [[0, 'still', 'smile'], [286, 'talk', 'smile']])} la={{ lines: ['HOUSEHOLD', '!ADDS EVERYONE'], at: [283.2, 284.0] }} lb={{ lines: ['THIS BUILDING', '!ONE PAYCHECK'], at: [286.1, 287.0] }} />],
  [291.0, 296.6, 'Двое работают — выше', (p) => <HouseKey {...p} who={[who('door50', [-1.2, 0, -2], 0.2, [[0, 'still', 'smile'], [293, 'cheer', 'grin']]), who('door25', [1.0, 0, -2], -0.2, [[0, 'still', 'smile'], [293.4, 'cheer', 'grin']])]} />],
  [296.6, 301.9, 'Лестница уже не пологая', (p) => <Stairs {...p} labels={STEPS} heights={RISE} hi={2} step={[10, 12, 297, 300]} acts={[[0, 'still', 'o']]} />],
  /* ---------------- door 75 + quiz ---------------- */
  [301.9, 306.2, 'Дверь 75, этаж 8', (p) => <Exterior {...p} cam="floor" floor={8} lift={[5, 8, 302, 304.5]} />],
  [306.2, 311.0, '$1908 в неделю', (p) => <Door {...p} door={75} floor={8} who="door75" open={306.4} lines={['DOOR 75', '!$1,908 / WEEK', '× 52 = $99,216', 'JUST UNDER $100,000']} at={[306.3, 306.4, 308.5, 313.0]} acts={[[0, 'still', 'smile'], [307, 'present', 'grin']]} />],
  [311.0, 315.3, 'Чуть меньше шести цифр', (p) => <Door {...p} cam={1} door={75} floor={8} who="door75" open={0} lines={['DOOR 75', '!$1,908 / WEEK', '× 52 = $99,216', 'JUST UNDER $100,000']} at={[0, 0, 0, 313.0]} />],
  [315.3, 322.6, 'Ответ: меньше 25 из 100', (p) => <HostOffice {...p} hi={9} board={{ lines: ['!QUIZ ANSWER', 'FEWER THAN', '!25 OF 100', 'MAKE SIX FIGURES'], at: [315.4, 317.1, 318.5, 319.5] }} acts={[[0, 'present', 'grin'], [321.7, 'shrug', 'smile']]} />],
  [322.6, 335.3, 'Ступенька $27', (p) => <Stairs {...p} labels={STEPS} heights={RISE} hi={2} step={[10, 15, 326, 331]} acts={[[0, 'still', 'smile'], [333.6, 'point', 'o']]} />],
  [335.3, 348.3, 'Бакалавр: $1602', (p) => <Bars {...p} title="WEEKLY PAY" bars={[bar('HIGH SCHOOL', '$993', 0.45, BLUE, 336.8), bar("BACHELOR'S", '$1,602', 0.73, GOLD, 344.0)]} who={who('grad', [-6.4, 0, -4], 0.5, [[0, 'still', 'smile'], [341.6, 'present', 'grin']])} />],
  [348.3, 361.4, 'Бакалавр и выше: $1752', (p) => <Bars {...p} title="WEEKLY PAY" bars={[bar('HIGH SCHOOL', '$993', 0.45, BLUE, 0), bar("BACHELOR'S", '$1,602', 0.73, GOLD, 0), bar("BACHELOR'S+", '$1,752', 0.8, GOLD, 352.5)]} cam={1} />],
  [361.4, 367.7, 'На 76% больше', (p) => <Board {...p} who="grad" lines={['HIGH SCHOOL $993', 'DEGREE $1,752', '!+76%']} at={[362.1, 363.5, 366.0]} acts={[[0, 'present', 'grin']]} />],
  /* ---------------- the elevator ---------------- */
  [367.7, 376.0, 'Лифтёр: $109 910', (p) => <Lift {...p} open={368.5} dial={8} plates={{ lines: ['ELEVATOR INSTALLERS', '& REPAIRERS (BLS)', '!$109,910 / YEAR', 'MAY 2025'], at: [371.0, 372.5, 377.0, 380.0] }} who={[who('elevator', [0, 0, -7.6], 0, [[0, 'still', 'smile'], [369.5, 'present', 'grin']])]} />],
  [376.0, 384.0, 'Медиана $109 910', (p) => <Lift {...p} cam={1} open={0} dial={8} who={[who('elevator', [0, 0, -7.6], 0, [[0, 'present', 'grin'], [381, 'talk', 'smile']])]} />],
  [384.0, 386.8, 'Аттестат + ученичество', (p) => <Board {...p} who="elevator" lines={['ENTRY:', 'HIGH SCHOOL DIPLOMA', '!+ APPRENTICESHIP']} at={[384.0, 384.4, 385.3]} acts={[[0, 'present', 'grin']]} />],
  [386.8, 396.8, 'Сравнение с бакалавром', (p) => <Duo {...p} a={who('grad', [-3.2, 0, -5], 0.15, [[0, 'still', 'smile']])} b={who('elevator', [3.2, 0, -5], -0.15, [[0, 'still', 'smile'], [394, 'present', 'grin']])} la={{ lines: ["BACHELOR'S", '$1,602 / WEEK', '!≈ $83,300 / YEAR'], at: [387.0, 390.0, 394.0] }} lb={{ lines: ['ELEVATOR TECH', '!$109,910 / YEAR'], at: [387.5, 388.0] }} />],
  [396.8, 405.1, 'Больше на $26 600', (p) => <Bars {...p} title="+ $26,600" bars={[bar("BACHELOR'S", '$83,300', 0.76, BLUE, 397.0), bar('ELEVATOR', '$109,910', 1, GOLD, 398.5)]} who={who('elevator', [6.4, 0, -4], -0.5, [[0, 'still', 'smile'], [400, 'cheer', 'grin']])} />],
  [405.1, 409.0, 'Грубое сравнение', (p) => <HostOffice {...p} cam={1} acts={[[0, 'shrug', 'smile'], [407, 'point', 'smug']]} />],
  [409.0, 417.2, 'Не бросайте колледж', (p) => <HostOffice {...p} board={{ lines: ["I'M NOT SAYING", 'SKIP COLLEGE', '!A MEDIAN = A GROUP', '!NOT YOU'], at: [409.5, 411.5, 414.2, 415.6] }} acts={[[0, 'shrug', 'smile'], [414.2, 'point', 'smile']]} />],
  [417.2, 426.0, 'Высота, тяжести, вызовы', (p) => <Lift {...p} open={417.4} dial={6} plates={{ lines: ['APPRENTICESHIP', 'HEIGHTS', 'HEAVY EQUIPMENT', '!ON CALL'], at: [417.4, 419.6, 420.4, 421.8] }} who={[who('elevator', [0, 0, -7.6], 0, [[0, 'still', 'smile'], [424.5, 'present', 'grin']])]} />],
  [426.0, 433.3, 'Премия за диплом и потолок', (p) => <Board {...p} lines={['DEGREE PREMIUM', '!↔ OVERLAP ↔', 'PAYCHECK CEILING']} at={[428.8, 430.8, 431.6]} />],
  /* ---------------- door 90 ---------------- */
  [433.3, 439.0, 'Дверь 90: $2919', (p) => <Door {...p} door={90} floor={9} who="door90" open={434} lines={['DOOR 90', '!$2,919 / WEEK', '≈ $152,000 / YEAR', '≈ $73 / HOUR']} at={[433.4, 436.8, 438.9, 442.1]} acts={[[0, 'still', 'smug'], [437, 'present', 'smug']]} />],
  [439.0, 444.4, '$73 в час', (p) => <Door {...p} cam={2} door={90} floor={9} who="door90" open={0} lines={['DOOR 90', '!$2,919 / WEEK', '≈ $152,000 / YEAR', '≈ $73 / HOUR']} at={[0, 0, 0, 442.1]} acts={[[0, 'talk', 'smug']]} />],
  [444.4, 453.2, '4.6 к 1', (p) => <Bars {...p} title="4.6 : 1" bars={[bar('DOOR 10', '$634', 0.22, BLUE, 445.5), bar('DOOR 90', '$2,919', 1, GOLD, 446.5)]} who={who('door90', [6.4, 0, -4], -0.5, [[0, 'still', 'smug'], [449, 'present', 'smug']])} />],
  [453.2, 466.3, 'Ступенька $67', (p) => <Stairs {...p} labels={STEPS} heights={RISE} hi={3} step={[15, 20, 454, 460]} acts={[[0, 'still', 'o'], [462.2, 'shrug', 'o']]} />],
  [466.3, 473.5, 'Выше — этаж 10', (p) => <Exterior {...p} cam="top" floor={10} />],
  [473.5, 479.5, 'Другая лестница: IRS', (p) => <Board {...p} lines={['IRS: TAX RETURNS', 'NOT PAYCHECKS', '!DIFFERENT LADDER']} at={[473.6, 475.0, 477.3]} />],
  [479.5, 494.5, 'Доход по налоговым декларациям', (p) => <Board {...p} cam={1} lines={['ADJUSTED GROSS INCOME', 'PER TAX RETURN · 2023', '+ INVESTMENTS & BUSINESS', '1 RETURN = 1–2 PEOPLE', "!DON'T STACK ON THE DOORS"]} at={[479.7, 482.0, 484.0, 487.0, 489.5]} />],
  /* ---------------- penthouse ---------------- */
  [494.5, 499.0, 'Где начинается топ-1%?', (p) => <Penthouse {...p} plates={{ lines: ['TOP 1% STARTS AT', '!?'], at: [494.6, 496.0] }} />],
  [499.0, 509.0, 'Топ-1% и топ-0.1%', (p) => <Penthouse {...p} plates={{ lines: ['TOP 1%', '!$675,602', 'TOP 0.1%', '!$3,100,950'], at: [499.0, 499.2, 501.0, 505.5] }} acts={[[0, 'present', 'smug'], [505.5, 'cheer', 'grin']]} />],
  [509.0, 520.1, '20.6% дохода, 38.4% налога', (p) => <Bars {...p} title="TOP 1% OF RETURNS" bars={[bar('SHARE OF INCOME', '20.6%', 0.54, GOLD, 511.5), bar('SHARE OF TAX', '38.4%', 1, RED, 515.5)]} who={who('penthouse', [-6.4, 0, -4], 0.5, [[0, 'present', 'smug']])} />],
  [520.1, 525.2, 'Оба числа верны', (p) => <HostOffice {...p} cam={1} acts={[[0, 'shrug', 'smile']]} />],
  [525.2, 533.3, 'Эффект пентхауса', (p) => <Penthouse {...p} plates={{ lines: ['FED: FAMILY INCOME', 'AVERAGE vs MEDIAN', '!?'], at: [525.4, 528.8, 531.0] }} />],
  [533.3, 548.1, 'Медиана $82 200, среднее $145 200', (p) => <Bars {...p} title="FAMILY INCOME · +77%" bars={[bar('MEDIAN', '$82,200', 0.57, BLUE, 535.2), bar('MEAN', '$145,200', 1, GOLD, 539.5)]} who={who('host', [-6.4, 0, -4], 0.5, [[0, 'talk', 'smile'], [544.2, 'point', 'smug']])} />],
  /* ---------------- women / men ---------------- */
  [548.1, 557.4, 'Женщины и мужчины', (p) => <Duo {...p} a={who('door50', [-3.2, 0, -5], 0.15, [[0, 'still', 'smile']])} b={who('door75', [3.2, 0, -5], -0.15, [[0, 'still', 'smile']])} la={{ lines: ['WOMEN · FULL-TIME', '!$1,127 / WEEK'], at: [550.8, 553.5] }} lb={{ lines: ['MEN · FULL-TIME', '!$1,352 / WEEK'], at: [553.6, 557.4] }} />],
  [557.4, 562.7, '83.4%', (p) => <Bars {...p} title="83.4%" bars={[bar('WOMEN', '$1,127', 0.83, GREEN, 557.5), bar('MEN', '$1,352', 1, BLUE, 557.9)]} cam={1} />],
  [562.7, 570.6, 'Сырой разрыв', (p) => <Board {...p} lines={['RAW GAP', 'ALL FULL-TIME WORKERS', '!NOT SAME JOB / SAME HOURS']} at={[562.8, 564.0, 565.8]} />],
  [570.6, 576.2, 'Разрыв в богатстве — другое', (p) => <HostOffice {...p} board={{ lines: ['GAP IN PAYCHECKS', '≠', '!GAP IN WHAT WE OWN'], at: [570.7, 573.1, 573.6] }} acts={[[0, 'talk', 'smile'], [573.1, 'point', 'o']]} />],
  /* ---------------- second elevator: net worth ---------------- */
  [576.2, 584.3, 'Второй лифт: капитал', (p) => <Exterior {...p} cam="wide" rocket={[1, 8, 579, 583]} sign="NET WORTH = OWN − OWE" />],
  [584.3, 595.2, 'Опрос ФРС', (p) => <Board {...p} lines={['FEDERAL RESERVE', 'SURVEY OF CONSUMER FINANCES', '!RANKS FAMILIES']} at={[584.5, 586.0, 590.9]} />],
  [595.2, 608.4, 'Медиана $215 900, среднее $1.24 млн', (p) => <Bars {...p} title="FAMILY NET WORTH · ≈ 6×" bars={[bar('MEDIAN', '$215,900', 0.17, BLUE, 598.9), bar('MEAN', '$1.24 M', 1, GOLD, 602.4)]} who={who('penthouse', [6.4, 0, -4], -0.5, [[0, 'still', 'smug'], [604.5, 'present', 'smug']])} />],
  [608.4, 611.0, 'Снова пентхаус', (p) => <Penthouse {...p} acts={[[0, 'cheer', 'grin']]} />],
  [611.0, 620.8, 'Две лестницы: угадайте', (p) => <Board {...p} lines={['BOTTOM 20%  vs  TOP 10%', 'TYPICAL INCOME', '!HOW MANY TIMES?']} at={[613.6, 617.5, 618.2]} acts={[[0, 'think', 'smile']]} />],
  [620.8, 631.5, 'Доход: в 16 раз', (p) => <Bars {...p} title="INCOME ≈ 16×" bars={[bar('BOTTOM 20%', '$24,600', 0.064, BLUE, 623.4), bar('TOP 10%', '$387,200', 1, GOLD, 625.0)]} />],
  [631.5, 640.2, 'Капитал: в 255 раз', (p) => <Bars {...p} title="NET WORTH ≈ 255×" bars={[bar('BOTTOM 20%', '$14,400', 0.02, BLUE, 632.9), bar('TOP 10%', '$3.67 M', 1, GOLD, 634.5)]} who={who('penthouse', [6.4, 0, -4], -0.5, [[0, 'still', 'smug'], [637.8, 'cheer', 'grin']])} />],
  [640.2, 645.5, 'Лестница и ракета', (p) => <Exterior {...p} cam="wide" lift={[1, 10, 640.3, 642.6]} rocket={[1, 10, 643.0, 645.3]} />],
  /* ---------------- the key ---------------- */
  [645.5, 650.5, 'Ключ к зданию', (p) => <HouseKey {...p} plates={{ lines: ['!THE KEY'], at: [648.9] }} />],
  [650.5, 664.0, 'Владельцы и арендаторы', (p) => <Duo {...p} a={who('door90', [-3.2, 0, -5], 0.15, [[0, 'still', 'smug']])} b={who('young', [3.2, 0, -5], -0.15, [[0, 'still', 'smile'], [664, 'shrug', 'o']])} la={{ lines: ['OWN A HOME', 'INCOME $108,900', '!WEALTH $458,900'], at: [650.6, 651.8, 662.0] }} lb={{ lines: ['RENT', 'INCOME $50,300', '!WEALTH $10,600'], at: [655.5, 657.0, 664.0] }} />],
  [664.0, 671.6, 'Вдвое больше зарплата, в 43 раза капитал', (p) => <Bars {...p} title="2× PAY · 43× WEALTH" bars={[bar('RENT', '$10,600', 0.023, BLUE, 664.2), bar('OWN', '$458,900', 1, GOLD, 665.0)]} />],
  [671.6, 687.0, 'Ключ подорожал', (p) => <HouseKey {...p} plates={{ lines: ['PAYMENT ON MEDIAN HOME', '!33% OF INCOME', 'ALL-TIME HIGH', '2022: 26%'], at: [673.8, 677.0, 680.6, 683.1] }} who={[who('young', [0.5, 0, -2], 0, [[0, 'still', 'smile'], [677, 'shrug', 'o']])]} />],
  [687.0, 696.5, 'Колледж: ×2.1 доход, ×4.7 капитал', (p) => <Bars {...p} title="COLLEGE vs HIGH SCHOOL FAMILIES" bars={[bar('INCOME', '× 2.1', 0.45, BLUE, 689.0), bar('WEALTH', '× 4.7', 1, GOLD, 693.6)]} who={who('grad', [-6.4, 0, -4], 0.5, [[0, 'still', 'smile'], [693.6, 'cheer', 'grin']])} />],
  [696.5, 700.5, 'Лестницы и обрывы', (p) => <Board {...p} lines={['INCOME GAPS = STAIRCASES', '!WEALTH GAPS = CLIFFS']} at={[696.6, 698.7]} />],
  /* ---------------- age ---------------- */
  [700.5, 718.5, 'Возраст', (p) => <Duo {...p} a={who('young', [-3.2, 0, -5], 0.15, [[0, 'still', 'smile'], [706, 'shrug', 'o']])} b={who('retiree', [3.2, 0, -5], -0.15, [[0, 'still', 'smile'], [717, 'present', 'grin']])} la={{ lines: ['UNDER 35', '!$33,000', '−23% SINCE 2022'], at: [703.0, 706.0, 708.0] }} lb={{ lines: ['65–74: $431,300', '!75+: $504,900'], at: [711.5, 717.0] }} />],
  [718.5, 726.3, '29 лет: этаж 8 по зарплате, подвал по капиталу', (p) => <Exterior {...p} cam="wide" lift={[1, 8, 719.5, 722.5]} rocket={[3, 1, 722.5, 725.5]} />],
  [726.3, 735.0, 'Пенсионер: баланс как в пентхаусе', (p) => <Penthouse {...p} acts={[[0, 'present', 'smug']]} extra={[who('retiree', [-3.0, 0, -3.4], 0.4, [[0, 'still', 'smile'], [728, 'cheer', 'grin']])]} plates={{ lines: ['SAME BUILDING', 'TWO ELEVATORS', '!TWO DIFFERENT FLOORS'], at: [731.0, 732.0, 733.5] }} />],
  /* ---------------- your floor ---------------- */
  [735.0, 741.0, 'На каком вы этаже?', (p) => <HostOffice {...p} cam={1} acts={[[0, 'point', 'smile']]} />],
  [741.0, 762.8, 'Таблица этажей', (p) => <Board {...p} cam={1} lines={['UNDER $634 → FLOOR 1', 'UP TO $849 → 2–3', 'UP TO $1,232 → 3–5', 'UP TO $1,908 → 6–8', 'UP TO $2,919 → 8–9', '!ABOVE → FLOOR 10']} at={[741.1, 745.0, 749.0, 753.5, 758.0, 761.6]} />],
  [762.8, 771.2, 'Второй лифт: активы минус долги', (p) => <Board {...p} lines={['SECOND ELEVATOR', 'ASSETS − DEBTS', '!vs FED NUMBER FOR YOUR AGE']} at={[762.9, 764.5, 766.5]} />],
  [771.2, 780.7, 'Ваша прибавка минус 3.5', (p) => <Board {...p} napkin lines={['YOUR LAST RAISE (%)', '!− 3.5', '< 0 → PRICES OUTRAN YOU']} at={[771.3, 775.0, 777.8]} />],
  [780.7, 794.6, 'Средняя дверь: +$18 против +$42', (p) => <Door {...p} door={50} floor={5} who="door50" open={781} lines={['DOOR 50 · $64,000', 'PAY + $18', '!BILL + $42']} at={[783.0, 786.5, 790.0]} acts={[[0, 'still', 'smile'], [790, 'shrug', 'o']]} />],
  [794.6, 800.5, 'В следующий раз — аренда', (p) => <Exterior {...p} cam="wide" night sign="NEXT: MINUS RENT" />],
  [800.5, 805.4, 'Напишите номер своей двери', (p) => <HostOffice {...p} cam={1} board={{ lines: ['!YOUR DOOR #?', 'JUST THE DOOR,', 'NOT THE DOLLARS'], at: [800.6, 802.7, 803.6] }} acts={[[0, 'wave', 'grin']]} />],
];

export const SHOTS: ShotDef[] = rows.map(([from, to, name, C]) => ({ from, to, name, C }));
