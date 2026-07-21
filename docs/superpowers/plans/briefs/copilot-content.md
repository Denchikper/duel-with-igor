# Бриф для Copilot — трек «Контент»

> **Исполнитель:** mazz1k (Copilot). Ветка `track/content`, зона `content/`.
> Скопировать всё, что ниже разделителя, целиком в чат с Copilot.

---

Мы делаем Telegram Mini App для хакатона: «Дуэль с Игорем» — асинхронные дуэли по задачам ЕГЭ по информатике. Игрок проходит 7 вопросов на время, кидает другу ссылку-вызов, друг проходит те же вопросы, дальше экран сравнения. Персонаж-ведущий — Игорь Линьков, преподаватель информатики.

Ты отвечаешь за **весь контент**. Твоя зона — только каталог `content/`. Файлы за его пределами не создавай и не редактируй, над ними параллельно работают двое других. Работай в ветке `track/content`.

Типы данных лежат в `src/contracts.ts` — прочитай его, но **не меняй**.

## Задача 1 — `content/igor-lines.json`

Реплики Игоря на девять событий. Ровно эти девять ключей, ни одного лишнего, ни одного пропущенного:

`run_start`, `correct`, `wrong`, `streak3`, `fast_answer`, `timeout`, `duel_win`, `duel_loss`, `duel_draw`

Значение каждого ключа — массив строк. **Минимум 6 реплик в каждом массиве.**

Требования к репликам:
- Длина до 90 символов — иначе не помещается в пузырь на экране телефона.
- Тон: ироничный преподаватель, который подкалывает, но не унижает. Без сюсюканья, без капса, без восклицательных знаков через одно слово.
- Никаких эмодзи.

Образец тона:

```json
{
  "wrong": [
    "Мимо. Читай условие внимательнее.",
    "Нет. Классическая ошибка, кстати.",
    "Не то. Разберём в конце."
  ],
  "streak3": [
    "Три подряд. Начинаю уважать.",
    "Серия. Вот так и надо.",
    "Три из трёх. Кто-то готовился."
  ]
}
```

Проверь себя командой:

```bash
node -e "const l=require('./content/igor-lines.json');const k=['run_start','correct','wrong','streak3','fast_answer','timeout','duel_win','duel_loss','duel_draw'];const bad=k.filter(x=>!Array.isArray(l[x])||l[x].length<6);console.log(bad.length?'МАЛО РЕПЛИК: '+bad:'OK, ключей '+Object.keys(l).length)"
```

Должно вывести `OK, ключей 9`.

Коммит: `git add content/igor-lines.json && git commit -m "content: add igor line bank"`

## Задача 2 — `content/questions.json`

Массив из **не менее 50 вопросов** ЕГЭ по информатике. Поле `id` не указывай — его генерирует база.

Формат одного объекта:

```json
{
  "topic": "Системы счисления",
  "difficulty": 1,
  "text": "Сколько единиц в двоичной записи числа 42?",
  "options": ["2", "3", "4", "5"],
  "correct_index": 1,
  "explanation": "42 в двоичной системе — 101010. Единиц в записи три.",
  "igor_comment": "Переводить в двоичную надо уметь на автомате."
}
```

Жёсткие требования — нарушение любого ломает приложение:

- `options` — **ровно 4 строки**.
- `correct_index` — число от 0 до 3, индекс верного варианта в `options`. Перепроверь каждый: это самая частая ошибка, и она незаметна.
- `difficulty` — 1, 2 или 3.
- `explanation` — почему верен именно этот вариант, 1–3 предложения по существу. Не «потому что так», а с ходом решения.
- `igor_comment` — короткая реплика Игоря про эту конкретную задачу, до 90 символов.
- **Вопрос должен решаться в уме за 30 секунд** — на него стоит таймер. Задачи на длинные вычисления не подходят.
- Неверные варианты должны быть правдоподобными: типичные ошибки, а не случайные числа.

Распределение по темам:

| Тема | Штук |
|---|---|
| Системы счисления | 8 |
| Логика и таблицы истинности | 8 |
| Кодирование информации и объём данных | 7 |
| Алгоритмы и исполнители | 7 |
| Python: результат выполнения фрагмента | 8 |
| Графы и поиск кратчайшего пути | 6 |
| Таблицы истинности и запросы к БД | 6 |

Сложность по всему набору примерно: 40% — difficulty 1, 40% — 2, 20% — 3.

Для вопросов с кодом на Python перенос строк ставь как `\n` внутри JSON-строки, отступы сохраняй — они значимы.

Проверь себя командой:

```bash
node -e "
const q = require('./content/questions.json');
const bad = q.filter(x =>
  !Array.isArray(x.options) || x.options.length !== 4 ||
  typeof x.correct_index !== 'number' || x.correct_index < 0 || x.correct_index > 3 ||
  ![1,2,3].includes(x.difficulty) ||
  !x.text || !x.explanation || !x.igor_comment || !x.topic
);
console.log('всего: ' + q.length + ', битых: ' + bad.length);
if (bad.length) console.log(JSON.stringify(bad.slice(0,3), null, 2));
"
```

Должно вывести `битых: 0`. Если нет — чини, пока не ноль.

Коммит: `git add content/questions.json && git commit -m "content: add 50 ege questions"`

## Задача 3 — `content/seed.mjs`

Скрипт загрузки вопросов в Supabase:

```js
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Нет VITE_SUPABASE_URL или VITE_SUPABASE_ANON_KEY в окружении.');
  process.exit(1);
}

const questions = JSON.parse(readFileSync('./content/questions.json', 'utf8'));
const supabase = createClient(url, key);

const { data, error } = await supabase.from('questions').insert(questions).select('id');

if (error) {
  console.error('Ошибка загрузки:', error.message);
  process.exit(1);
}

console.log(`Загружено вопросов: ${data.length}`);
```

Запуск: `set -a && source .env.local && set +a && node content/seed.mjs`

Если ругается на RLS — политики `insert` на таблице `questions` нет намеренно. Загрузи вопросы через SQL Editor в панели Supabase или попроси владельца ядра временно открыть политику.

Коммит: `git add content/seed.mjs && git commit -m "content: add supabase seed script"`

## Порядок и приоритет

Делай в порядке: реплики → вопросы → сид-скрипт. Реплики нужны ядру раньше всего, они блокируют игровой экран.

Если времени в обрез — 30 качественных вопросов с хорошими разборами лучше, чем 50 сырых с ошибками в `correct_index`. Один неверный ответ, замеченный жюри на демо, стоит дороже, чем двадцать недостающих вопросов.
