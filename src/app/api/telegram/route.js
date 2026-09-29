import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

console.log('🔧 [route.js] loaded. Token:', BOT_TOKEN ? 'yes' : 'NO', 'Admin:', ADMIN_CHAT_ID || 'NO');

// ============ sendMessage с логами ============
async function sendMessage(chatId, text, keyboard) {
    console.log('📤 sendMessage START → chatId:', chatId);

    if (!BOT_TOKEN) {
        console.error('❌ НЕТ BOT_TOKEN');
        return { ok: false, error: 'no token' };
    }

    const body = {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
    };
    if (keyboard) body.reply_markup = { inline_keyboard: keyboard };

    try {
        const res = await fetch(`${API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();

        console.log('📥 sendMessage ответ:', JSON.stringify(data).slice(0, 300));

        if (!data.ok) {
            console.error('❌ sendMessage FAILED:', data.description);
        } else {
            console.log('✅ sendMessage OK, msg_id:', data.result?.message_id);
        }
        return data;
    } catch (err) {
        console.error('❌ sendMessage EXCEPTION:', err.message);
        return { ok: false, error: err.message };
    }
}

// ============ Клавиатуры и текст ============
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

const TEXT_START =
    '☕ *Добро пожаловать в Qahva Bukhara!*\n\n' +
    'Место, где кофе встречается с искусством.\n' +
    'Работаем *круглосуточно · 24/7* 🕐\n\n' +
    'Выберите, что вас интересует:';

const TEXT_ABOUT =
    '☕ *О Qahva Bukhara*\n\n' +
    'Кофейня в Бухаре, где каждый напиток готовится с любовью.\n\n' +
    '🕐 Работаем *круглосуточно · 24/7*\n' +
    '📍 Бухара, Узбекистан\n' +
    '📞 +998 99 702 00 30';

const TEXT_CONTACTS =
    '📞 *Контакты Qahva*\n\n' +
    '📱 Телефон: +998 99 702 00 30\n' +
    '💬 Telegram: @qahvabukhara_bot\n' +
    '📷 Instagram: @qahva.bukhara';

// ============ POST ============
export async function POST(req) {
    console.log('🚀 [POST] START');

    // --- ШАГ 1: парсинг JSON ---
    let update;
    try {
        const raw = await req.text();
        console.log('📥 RAW (первые 500):', raw.slice(0, 500));
        update = JSON.parse(raw);
        console.log('✅ JSON распарсен, update_id:', update.update_id);
    } catch (err) {
        console.error('❌ Ошибка парсинга JSON:', err.message);
        return NextResponse.json({ ok: true });
    }

    // --- ШАГ 2: определяем тип апдейта ---
    try {
        const hasMessage = !!update.message;
        const hasCallback = !!update.callback_query;
        console.log('🔎 hasMessage:', hasMessage, 'hasCallback:', hasCallback);

        // ==================== CALLBACK ====================
        if (hasCallback) {
            console.log('🔘 Callback data:', update.callback_query.data);
            const cb = update.callback_query;
            const chatId = cb.message.chat.id;
            const data = cb.data;

            // Answer callback (убрать «часики»)
            fetch(`${API}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: cb.id }),
            }).catch(() => { });

            let text = 'Обработка...';
            let keyboard = mainKeyboard;

            if (data === 'start') text = TEXT_START;
            else if (data === 'about') text = TEXT_ABOUT;
            else if (data === 'contacts') text = TEXT_CONTACTS;
            else if (data === 'address') {
                text = '📍 *Адрес:* Бухара, Узбекистан';
                keyboard = [
                    [{ text: '🗺 Яндекс.Карты', url: 'https://yandex.ru/maps/?text=Bukhara' }],
                    [{ text: '⬅️ Назад', callback_data: 'start' }],
                ];
            } else if (data === 'menu') {
                text = '☕ *Меню Qahva*\n\nСкоро здесь появятся категории 😊';
                keyboard = [[{ text: '⬅️ Назад', callback_data: 'start' }]];
            }

            await sendMessage(chatId, text, keyboard);
            return NextResponse.json({ ok: true });
        }

        // ==================== MESSAGE ====================
        if (hasMessage) {
            const msg = update.message;
            const chatId = msg.chat?.id;

            console.log('💬 chatId:', chatId);

            if (!chatId) {
                console.error('❌ Нет chatId!');
                return NextResponse.json({ ok: true });
            }

            const text = msg.text || '';
            const lower = text.toLowerCase();
            const noSlash = lower.replace(/^\//, '');

            console.log('📨 Text:', JSON.stringify(text));
            console.log('🔍 NoSlash:', JSON.stringify(noSlash));

            // /start
            if (noSlash === 'start' || noSlash.startsWith('start')) {
                console.log('✅ → start');
                await sendMessage(chatId, TEXT_START, mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            // menu
            if (noSlash.includes('menu') || lower.includes('меню')) {
                console.log('✅ → menu');
                await sendMessage(
                    chatId,
                    '☕ *Меню Qahva*\n\nСкоро здесь появятся категории 😊',
                    mainKeyboard
                );
                return NextResponse.json({ ok: true });
            }

            // contacts
            if (noSlash.includes('contact') || lower.includes('контакт')) {
                console.log('✅ → contacts');
                await sendMessage(chatId, TEXT_CONTACTS, mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            // address
            if (noSlash.includes('address') || lower.includes('адрес')) {
                console.log('✅ → address');
                await sendMessage(chatId, '📍 *Адрес:* Бухара, Узбекистан', mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            // about
            if (noSlash.includes('about') || lower.includes('о нас')) {
                console.log('✅ → about');
                await sendMessage(chatId, TEXT_ABOUT, mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            // Fallback
            console.log('⚠️ → fallback');
            await sendMessage(
                chatId,
                'Здравствуйте! 👋\n\nЯ бот кофейни *Qahva Bukhara*.\nНажмите кнопки ниже:',
                mainKeyboard
            );
            return NextResponse.json({ ok: true });
        }

        // Что-то другое
        console.log('⚠️ Апдейт неизвестного типа:', Object.keys(update));
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('❌❌❌ CRITICAL:', err.message);
        console.error('❌ Stack:', err.stack);
        return NextResponse.json({ ok: true });
    }
}

export async function GET() {
    return NextResponse.json({
        ok: true,
        message: 'Qahva Telegram webhook is running',
        version: '4.0',
        hasToken: !!BOT_TOKEN,
        hasAdmin: !!ADMIN_CHAT_ID,
    });
}