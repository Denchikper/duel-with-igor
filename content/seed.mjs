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
