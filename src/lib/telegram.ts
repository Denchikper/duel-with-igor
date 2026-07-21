import { QUESTIONS_PER_DUEL } from '../contracts';

export interface TgUser {
  id: number;
  name: string;
  photo_url: string | null;
}

interface TgWebApp {
  initDataUnsafe?: {
    user?: { id: number; first_name?: string; last_name?: string; photo_url?: string };
    start_param?: string;
  };
  ready(): void;
  expand(): void;
  openTelegramLink(url: string): void;
  showConfirm?(message: string, cb: (ok: boolean) => void): void;
  HapticFeedback?: {
    notificationOccurred(type: 'success' | 'error' | 'warning'): void;
  };
}

function webApp(): TgWebApp | null {
  return (window as unknown as { Telegram?: { WebApp: TgWebApp } }).Telegram?.WebApp ?? null;
}

export function initTelegram(): void {
  const app = webApp();
  if (!app) return;
  app.ready();
  app.expand();
}

export function getTelegramUser(): TgUser {
  const user = webApp()?.initDataUnsafe?.user;
  if (!user) return { id: 0, name: 'Гость', photo_url: null };
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Игрок';
  return { id: user.id, name, photo_url: user.photo_url ?? null };
}

// Реально ли мы внутри Telegram: скрипт telegram-web-app.js создаёт объект
// WebApp даже в обычном браузере, поэтому проверяем наличие пользователя.
export function isTelegram(): boolean {
  return Boolean(webApp()?.initDataUnsafe?.user);
}

export function getStartParam(): string | null {
  const fromTg = webApp()?.initDataUnsafe?.start_param;
  if (fromTg) return fromTg;
  return new URLSearchParams(window.location.search).get('duel');
}

export function shareDuel(duelId: string, score: number, timeMs: number): void {
  const seconds = (timeMs / 1000).toFixed(1);
  const text = `Я выбил ${score}/${QUESTIONS_PER_DUEL} за ${seconds}с у Игоря Линькова. Слабо повторить?`;
  const app = webApp();

  // Внутри Telegram — делимся ссылкой на бот-приложение (пока бот жив).
  if (app && isTelegram()) {
    const bot = import.meta.env.VITE_BOT_USERNAME || 'DuelWithIgorBot';
    const appName = import.meta.env.VITE_APP_NAME || 'game';
    const link = `https://t.me/${bot}/${appName}?startapp=${duelId}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    app.openTelegramLink(url);
    return;
  }

  // В браузере — обычная веб-ссылка на этот сайт с ?duel=.
  const base = `${window.location.origin}${window.location.pathname}`;
  const webLink = `${base.replace(/index\.html$/, '')}?duel=${duelId}`;
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
  if (nav.share) {
    nav.share({ title: 'Дуэль с Игорем', text, url: webLink }).catch(() => {});
  } else if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(webLink).then(
      () => alert('Ссылка-вызов скопирована — отправь её другу.'),
      () => window.prompt('Скопируй ссылку-вызов:', webLink),
    );
  } else {
    window.prompt('Скопируй ссылку-вызов:', webLink);
  }
}

export function haptic(type: 'success' | 'error'): void {
  webApp()?.HapticFeedback?.notificationOccurred(type);
}

// Подтверждение через нативный Telegram-диалог, с фолбэком на window.confirm.
export function confirmDialog(message: string, onConfirm: () => void): void {
  const app = webApp();
  // showConfirm может существовать, но бросать WebAppMethodUnsupported
  // (старый клиент или не в Telegram) — тогда падаем на window.confirm.
  if (app?.showConfirm) {
    try {
      app.showConfirm(message, (ok) => {
        if (ok) onConfirm();
      });
      return;
    } catch {
      /* фолбэк ниже */
    }
  }
  if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
    if (window.confirm(message)) onConfirm();
    return;
  }
  onConfirm();
}
