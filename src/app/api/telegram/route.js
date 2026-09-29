import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const TEXT_START =
    '☕ Добро пожаловать в Qahva Bukhara!\n\n' +
    'Место, где кофе встречается с искусством.\n' +
    'Работаем круглосуточно · 24/7 🕐\n\n' +
    'Выберите, что вас интересует:';

const TEXT_ABOUT =
    '☕ О Qahva Bukhara\n\n' +
    'Кофейня в Бухаре, где каждый напиток готовится с любовью.\n\n' +
    '🕐 Работаем круглосуточно · 24/7\n' +
    '📍 Бухара, Узбекистан\n' +
    '📞 +998 99 702 00 30';

const TEXT_CONTACTS =
    '📞 Контакты Qahva\n\n' +
    '📱 Телефон: +998 99 702 00 30\n' +
    '💬 Telegram: @qahvabukhara_bot\n' +
    '📷 Instagram: @qahva.bukhara';

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
        { text: '📷 Instagram', url: 'https://www.instagram.com/qahva.bukhara/' },
        { text: '📞 Позвонить', url: 'tel:+998997020030' },
    ],
];

async function sendMessage(chatId, text, keyboard) {
    if (!BOT_TOKEN) {
        console.error('❌ Нет BOT_TOKEN');
        return;
    }

    const body = {
        chat_id: chatId,
        text,
        // БЕЗ parse_mode — работает всегда
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
            console.log('✅ sendMessage OK, msg_id:', data.result?.message_id);
        }
    } catch (err) {
        console.error('❌ sendMessage error:', err.message);
    }
}

export async function POST(req) {
    console.log('🚀 POST start');

    let update;
    try {
        update = await req.json();
        console.log('✅ Update parsed, id:', update.update_id);
    } catch (err) {
        console.error('❌ JSON parse failed:', err.message);
        return NextResponse.json({ ok: true });
    }

    try {
        // ===== CALLBACK =====
        if (update.callback_query) {
            const cb = update.callback_query;
            const chatId = cb.message.chat.id;
            const data = cb.data;

            console.log('🔘 Callback:', data);

            fetch(`${API}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: cb.id }),
            }).catch(() => { });

            if (data === 'start') {
                await sendMessage(chatId, TEXT_START, mainKeyboard);
            } else if (data === 'about') {
                await sendMessage(chatId, TEXT_ABOUT, mainKeyboard);
            } else if (data === 'contacts') {
                await sendMessage(chatId, TEXT_CONTACTS, mainKeyboard);
            } else if (data === 'address') {
                await sendMessage(chatId, '📍 Адрес: Бухара, Узбекистан', [
                    [{ text: '🗺 Яндекс.Карты', url: 'https://yandex.ru/maps/?text=Bukhara' }],
                    [{ text: '⬅️ Назад', callback_data: 'start' }],
                ]);
            } else if (data === 'menu') {
                await sendMessage(chatId, '☕ Меню Qahva\n\nСкоро здесь появятся категории 😊', [
                    [{ text: '⬅️ Назад', callback_data: 'start' }],
                ]);
            }

            return NextResponse.json({ ok: true });
        }

        // ===== MESSAGE =====
        if (update.message) {
            const msg = update.message;
            const chatId = msg.chat.id;
            const text = (msg.text || '').trim();
            const lower = text.toLowerCase();
            const cmd = lower.replace(/^\//, '');

            console.log('💬 Text:', text, '| cmd:', cmd);

            if (cmd === 'start' || cmd.startsWith('start')) {
                await sendMessage(chatId, TEXT_START, mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            if (cmd === 'menu' || cmd.includes('menu') || lower.includes('меню')) {
                await sendMessage(
                    chatId,
                    '☕ Меню Qahva\n\nСкоро здесь появятся категории 😊',
                    mainKeyboard
                );
                return NextResponse.json({ ok: true });
            }

            if (cmd === 'contacts' || lower.includes('контакт')) {
                await sendMessage(chatId, TEXT_CONTACTS, mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            if (cmd === 'address' || lower.includes('адрес')) {
                await sendMessage(chatId, '📍 Адрес: Бухара, Узбекистан', [
                    [{ text: '🗺 Яндекс.Карты', url: 'https://yandex.ru/maps/?text=Bukhara' }],
                    [{ text: '⬅️ Назад', callback_data: 'start' }],
                ]);
                return NextResponse.json({ ok: true });
            }

            if (cmd === 'about' || lower.includes('о нас')) {
                await sendMessage(chatId, TEXT_ABOUT, mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            // Fallback
            await sendMessage(
                chatId,
                'Здравствуйте! 👋\n\nЯ бот кофейни Qahva Bukhara.\nНажмите кнопки ниже:',
                mainKeyboard
            );
            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('❌ CRITICAL:', err.message);
        return NextResponse.json({ ok: true });
    }
}

export async function GET() {
    return NextResponse.json({
        ok: true,
        message: 'Qahva Telegram webhook is running',
        version: '6.0-no-markdown',
        hasToken: !!BOT_TOKEN,
    });
}