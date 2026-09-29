import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const PHONE = '+998 99 702 00 30';
const PHONE_RAW = '+998997020030';
const INSTAGRAM = 'https://www.instagram.com/qahva.bukhara/';
const ADDRESS = 'Бухара, Узбекистан';

// ============ ЛОГИ при загрузке модуля ============
console.log('🔧 [route.js] Модуль загружается');
console.log('🔧 BOT_TOKEN:', BOT_TOKEN ? `есть (${BOT_TOKEN.slice(0, 10)}...)` : '❌ ПУСТОЙ!');
console.log('🔧 ADMIN_CHAT_ID:', ADMIN_CHAT_ID || '❌ ПУСТОЙ!');

// ============ Отправка сообщения ============
async function sendMessage(chatId, text, keyboard) {
    console.log('📤 sendMessage →', chatId);
    console.log('📤 Text:', text.slice(0, 80));

    if (!BOT_TOKEN) {
        console.error('❌ BOT_TOKEN пустой — отправить не могу');
        return { ok: false };
    }

    const body = {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
    };
    if (keyboard) body.reply_markup = { inline_keyboard: keyboard };

    try {
        const res = await fetch(`${API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!data.ok) {
            console.error('❌ sendMessage FAILED:', JSON.stringify(data));
        } else {
            console.log('✅ sendMessage OK, message_id:', data.result?.message_id);
        }
        return data;
    } catch (err) {
        console.error('❌ sendMessage fetch error:', err);
        return { ok: false };
    }
}

// ============ Клавиатуры ============
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

const TEXT = {
    start:
        '☕ *Добро пожаловать в Qahva Bukhara!*\n\n' +
        'Место, где кофе встречается с искусством.\n' +
        'Работаем *круглосуточно · 24/7* 🕐\n\n' +
        'Выберите, что вас интересует:',
    about:
        '☕ *О Qahva Bukhara*\n\n' +
        'Мы — кофейня в Бухаре, где каждый напиток готовится с любовью.\n\n' +
        '🕐 Работаем *круглосуточно · 24/7*\n' +
        `📍 ${ADDRESS}\n` +
        `📞 ${PHONE}`,
    contacts:
        '📞 *Контакты Qahva*\n\n' +
        `📱 Телефон: ${PHONE}\n` +
        '💬 Telegram: @qahvabukhara_bot\n' +
        `📷 Instagram: [@qahva.bukhara](${INSTAGRAM})\n\n` +
        '🕐 Работаем *круглосуточно · 24/7*',
};

// ============ POST ============
export async function POST(req) {
    console.log('🚀 [POST] /api/telegram ВЫЗВАН');

    let update;
    try {
        update = await req.json();
        console.log('📥 Update получен:', JSON.stringify(update).slice(0, 200));
    } catch (err) {
        console.error('❌ Не удалось распарсить JSON:', err);
        return NextResponse.json({ ok: true });
    }

    try {
        // ========== CALLBACK (кнопки) ==========
        if (update.callback_query) {
            console.log('🔘 Callback:', update.callback_query.data);
            const cb = update.callback_query;
            const chatId = cb.message.chat.id;

            await fetch(`${API}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: cb.id }),
            });

            if (cb.data === 'start') {
                await sendMessage(chatId, TEXT.start, mainKeyboard);
            } else if (cb.data === 'about') {
                await sendMessage(chatId, TEXT.about, mainKeyboard);
            } else if (cb.data === 'contacts') {
                await sendMessage(chatId, TEXT.contacts, mainKeyboard);
            } else if (cb.data === 'address') {
                await sendMessage(chatId, `📍 *Адрес:* ${ADDRESS}`, [
                    [{ text: '🗺 Яндекс.Карты', url: 'https://yandex.ru/maps/?text=Bukhara' }],
                    [{ text: '⬅️ Назад', callback_data: 'start' }],
                ]);
            } else if (cb.data === 'menu') {
                await sendMessage(chatId, '☕ *Меню Qahva*\n\nСкоро здесь появятся категории 😊', [
                    [{ text: '⬅️ Назад', callback_data: 'start' }],
                ]);
            }

            return NextResponse.json({ ok: true });
        }

        // ========== MESSAGE (текст) ==========
        if (update.message) {
            const msg = update.message;
            const chatId = msg.chat.id;
            const text = (msg.text || '').trim();
            const lower = text.toLowerCase();
            const noSlash = lower.replace(/^\//, '');

            console.log('📨 Text:', JSON.stringify(text));
            console.log('🔍 Lower:', JSON.stringify(lower));
            console.log('🔍 NoSlash:', JSON.stringify(noSlash));

            // /start
            if (noSlash === 'start' || noSlash.startsWith('start')) {
                console.log('✅ Обработка: /start');
                await sendMessage(chatId, TEXT.start, mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            // меню / menu
            if (noSlash === 'menu' || noSlash.includes('menu') || lower.includes('меню')) {
                console.log('✅ Обработка: menu');
                await sendMessage(chatId, '☕ *Меню Qahva*\n\nСкоро здесь появятся категории 😊', mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            // контакты
            if (noSlash === 'contacts' || lower.includes('контакт')) {
                console.log('✅ Обработка: contacts');
                await sendMessage(chatId, TEXT.contacts, mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            // адрес
            if (noSlash === 'address' || lower.includes('адрес')) {
                console.log('✅ Обработка: address');
                await sendMessage(chatId, `📍 *Адрес:* ${ADDRESS}`, mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            // Fallback
            console.log('⚠️ Fallback — команда не распознана');
            await sendMessage(
                chatId,
                'Здравствуйте! 👋\n\nЯ бот кофейни *Qahva Bukhara*.\nНажмите кнопки ниже:',
                mainKeyboard
            );
            return NextResponse.json({ ok: true });
        }

        console.log('⚠️ Не message и не callback — что-то другое');
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('❌❌❌ CRITICAL ERROR:', err.message);
        console.error('❌ Stack:', err.stack);
        return NextResponse.json({ ok: true });
    }
}

export async function GET() {
    return NextResponse.json({
        ok: true,
        message: 'Qahva Telegram webhook is running',
        version: '3.0-debug',
        hasToken: !!BOT_TOKEN,
        hasAdminChat: !!ADMIN_CHAT_ID,
    });
}