import { NextResponse } from 'next/server';
import { menu, categories } from '@/data/menu';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const PHONE = '+998 99 702 00 30';
const PHONE_RAW = '+998997020030';
const INSTAGRAM = 'https://www.instagram.com/qahva.bukhara/';
const ADDRESS = 'Бухара, Узбекистан';
const WORK_HOURS = 'Круглосуточно · 24/7';

const fmt = (n) => (n > 0 ? n.toLocaleString('ru-RU') + ' сум' : 'По запросу');

// ============ Отправка сообщения ============
async function sendMessage(chatId, text, keyboard) {
    const body = {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
    };
    if (keyboard) body.reply_markup = { inline_keyboard: keyboard };

    const res = await fetch(`${API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return res.json();
}

// ============ Клавиатура главного меню ============
const mainKeyboard = [
    [
        { text: '☕ Меню', callback_data: 'menu' },
        { text: '📍 Адрес', callback_data: 'address' },
    ],
    [
        { text: '📞 Контакты', callback_data: 'contacts' },
        { text: 'ℹ️ О нас', callback_data: 'about' },
    ],
    [
        { text: '📷 Instagram', url: INSTAGRAM },
        { text: '📞 Позвонить', url: `tel:${PHONE_RAW}` },
    ],
];

// ============ Клавиатура категорий ============
function categoriesKeyboard() {
    const rows = [];
    const cats = categories.filter((c) => c.id !== 'all');

    // По 2 в ряд
    for (let i = 0; i < cats.length; i += 2) {
        const row = [{ text: cats[i].name, callback_data: `cat_${cats[i].id}` }];
        if (cats[i + 1]) row.push({ text: cats[i + 1].name, callback_data: `cat_${cats[i + 1].id}` });
        rows.push(row);
    }
    rows.push([{ text: '⬅️ Назад', callback_data: 'start' }]);
    return rows;
}

// ============ Тексты ============
const TEXT = {
    start: `☕ *Добро пожаловать в Qahva Bukhara!*

Место, где кофе встречается с искусством.
Работаем *круглосуточно · 24/7* 🕐

Выберите, что вас интересует:`,

    about: `☕ *О Qahva Bukhara*

Мы — кофейня в Бухаре, где каждый напиток
готовится с любовью, а каждый десерт — маленькое
произведение искусства.

🕐 Работаем *круглосуточно · 24/7*
📍 ${ADDRESS}
📞 ${PHONE}

Что вас интересует?`,

    contacts: `📞 *Контакты Qahva*

📱 Телефон: ${PHONE}
💬 Telegram: @qahvabukhara_bot
📷 Instagram: [@qahva.bukhara](${INSTAGRAM})

🕐 Работаем *круглосуточно · 24/7*

Нажмите кнопки ниже, чтобы связаться:`,
};

// ============ Главный обработчик ============
export async function POST(req) {
    try {
        const update = await req.json();
        console.log('Telegram update:', JSON.stringify(update));

        // === CALLBACK (нажатие inline-кнопки) ===
        if (update.callback_query) {
            const cb = update.callback_query;
            const chatId = cb.message.chat.id;
            const data = cb.data;

            // Ответить на callback (убрать «часики»)
            await fetch(`${API}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: cb.id }),
            });

            if (data === 'start') {
                await sendMessage(chatId, TEXT.start, mainKeyboard);
            } else if (data === 'about') {
                await sendMessage(chatId, TEXT.about, mainKeyboard);
            } else if (data === 'contacts') {
                await sendMessage(chatId, TEXT.contacts, mainKeyboard);
            } else if (data === 'address') {
                await sendMessage(
                    chatId,
                    `📍 *Адрес Qahva Bukhara*\n\n${ADDRESS}\n\nОткройте на карте:`,
                    [
                        [{ text: '🗺 Открыть в Яндекс.Картах', url: 'https://yandex.ru/maps/?text=Bukhara%20Qahva' }],
                        [{ text: '⬅️ Назад', callback_data: 'start' }],
                    ]
                );
            } else if (data === 'menu') {
                await sendMessage(
                    chatId,
                    `☕ *Меню Qahva Bukhara*\n\nВыберите категорию:`,
                    categoriesKeyboard()
                );
            } else if (data.startsWith('cat_')) {
                const catId = data.replace('cat_', '');
                const cat = categories.find((c) => c.id === catId);
                const items = menu.filter((m) => m.cat === catId);

                if (!cat || !items.length) {
                    await sendMessage(chatId, 'Категория пуста', categoriesKeyboard());
                    return NextResponse.json({ ok: true });
                }

                let text = `*${cat.name}*\n\n`;
                items.forEach((i) => {
                    text += `• *${i.title}* — ${fmt(i.price)}\n`;
                    if (i.desc) text += `   _${i.desc}_\n`;
                    text += '\n';
                });

                // Кнопка Назад к категориям
                await sendMessage(chatId, text, [
                    [{ text: '⬅️ К категориям', callback_data: 'menu' }],
                    [{ text: '🏠 Главное меню', callback_data: 'start' }],
                ]);
            }

            return NextResponse.json({ ok: true });
        }

        // === MESSAGE (текстовые команды) ===
        if (update.message) {
            const msg = update.message;
            const chatId = msg.chat.id;
            const text = (msg.text || '').trim();
            const lower = text.toLowerCase();

            // /start
            if (text === '/start' || text.startsWith('/start')) {
                await sendMessage(chatId, TEXT.start, mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            // /menu или "меню"
            if (text === '/menu' || lower === 'меню' || lower.includes('меню')) {
                await sendMessage(
                    chatId,
                    `☕ *Меню Qahva Bukhara*\n\nВыберите категорию:`,
                    categoriesKeyboard()
                );
                return NextResponse.json({ ok: true });
            }

            // /contacts или "контакты"
            if (text === '/contacts' || lower.includes('контакт')) {
                await sendMessage(chatId, TEXT.contacts, mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            // /address или "адрес"
            if (text === '/address' || lower.includes('адрес') || lower.includes('где вы')) {
                await sendMessage(
                    chatId,
                    `📍 *Адрес Qahva Bukhara*\n\n${ADDRESS}\n\nОткройте на карте:`,
                    [
                        [{ text: '🗺 Открыть в Яндекс.Картах', url: 'https://yandex.ru/maps/?text=Bukhara%20Qahva' }],
                        [{ text: '⬅️ Назад', callback_data: 'start' }],
                    ]
                );
                return NextResponse.json({ ok: true });
            }

            // /about или "о нас"
            if (text === '/about' || lower.includes('о нас') || lower.includes('инфо')) {
                await sendMessage(chatId, TEXT.about, mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            // /help
            if (text === '/help') {
                await sendMessage(
                    chatId,
                    `📋 *Команды бота*\n\n` +
                    `/start — главное меню\n` +
                    `/menu — меню кофейни\n` +
                    `/contacts — контакты\n` +
                    `/address — адрес\n` +
                    `/about — о нас`,
                    mainKeyboard
                );
                return NextResponse.json({ ok: true });
            }

            // Fallback — приветствие + кнопки
            await sendMessage(
                chatId,
                `Здравствуйте! 👋\n\nЯ бот кофейни *Qahva Bukhara*.\nПомогу узнать меню, контакты и адрес.\n\nВыберите, что вас интересует:`,
                mainKeyboard
            );
            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('Webhook error:', err);
        // Всегда возвращаем 200, чтобы Telegram не ретраил бесконечно
        return NextResponse.json({ ok: true });
    }
}

// GET — для проверки, что эндпоинт живой
export async function GET() {
    return NextResponse.json({
        ok: true,
        message: 'Qahva Telegram webhook is running',
    });
}