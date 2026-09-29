import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ============ КОНТАКТЫ ============
const CONTACTS = {
    phone: '+998 99 702 00 30',
    phoneRaw: '+998997020030',
    telegram: 'https://t.me/qahvabukhara_bot',
    instagram: 'https://www.instagram.com/qahva.bukhara/',
    address: 'Бухара, улица Хофиз Таниша Бухорий, 10',
    lat: 39.769977,
    lng: 64.429131,
    hours: 'Круглосуточно · 24/7',
    site: 'https://www.qahvabukhara.uz',
    menuUrl: 'https://www.qahvabukhara.uz/#menu',
    // Ссылки на карты
    yandexMap: `https://yandex.ru/maps/?pt=${64.429131},${39.769977}&z=17&l=map`,
    googleMap: `https://www.google.com/maps?q=${39.769977},${64.429131}`,
};

// ============ ТЕКСТЫ (без Markdown-звёздочек) ============
const TEXT_START =
    '☕ Добро пожаловать в Qahva Bukhara!\n\n' +
    'Место, где кофе встречается с искусством.\n' +
    'Работаем круглосуточно · 24/7 🕐\n\n' +
    'Выберите, что вас интересует:';

const TEXT_ABOUT =
    '☕ О Qahva Bukhara\n\n' +
    'Кофейня в Бухаре, где каждый напиток готовится с любовью, ' +
    'а каждый десерт — маленькое произведение искусства.\n\n' +
    `🕐 Работаем ${CONTACTS.hours}\n` +
    `📍 ${CONTACTS.address}\n` +
    `📞 ${CONTACTS.phone}\n` +
    `🌐 ${CONTACTS.site}`;

const TEXT_CONTACTS =
    '📞 Контакты Qahva\n\n' +
    `📱 Телефон: ${CONTACTS.phone}\n` +
    '💬 Telegram: @qahvabukhara_bot\n' +
    '📷 Instagram: @qahva.bukhara\n\n' +
    `📍 ${CONTACTS.address}\n` +
    `🕐 ${CONTACTS.hours}`;

const TEXT_ADDRESS =
    '📍 Адрес Qahva Bukhara\n\n' +
    `${CONTACTS.address}\n\n` +
    `🕐 ${CONTACTS.hours}\n\n` +
    'Откройте на карте:';

const TEXT_MENU =
    '☕ Меню Qahva Bukhara\n\n' +
    'Свежеобжаренный кофе, авторские напитки, ' +
    'десерты и фреши — всё на нашем сайте.\n\n' +
    'Нажмите кнопку ниже 👇';

// ============ КЛАВИАТУРЫ ============
const mainKeyboard = [
    [
        { text: '☕ Меню', url: CONTACTS.menuUrl },
        { text: '📍 Адрес', callback_data: 'address' },
    ],
    [
        { text: '📞 Контакты', callback_data: 'contacts' },
        { text: 'ℹ️ О нас', callback_data: 'about' },
    ],
    [
        { text: '📷 Instagram', url: CONTACTS.instagram },
        { text: '🌐 Наш сайт', url: CONTACTS.site },
    ],
];

// Клавиатура для раздела "Меню"
const menuKeyboard = [
    [{ text: '☕ Открыть меню на сайте', url: CONTACTS.menuUrl }],
    [{ text: '⬅️ Назад', callback_data: 'start' }],
];

// Клавиатура для адреса
const addressKeyboard = [
    [{ text: '🗺 Яндекс.Карты', url: CONTACTS.yandexMap }],
    [{ text: '🌍 Google Maps', url: CONTACTS.googleMap }],
    [{ text: '⬅️ Назад', callback_data: 'start' }],
];

// Клавиатура для контактов
const contactsKeyboard = [
    [{ text: '📷 Instagram', url: CONTACTS.instagram }],
    [{ text: '🌐 Наш сайт', url: CONTACTS.site }],
    [{ text: '⬅️ Назад', callback_data: 'start' }],
];

// ============ ОТПРАВКА ============
async function sendMessage(chatId, text, keyboard) {
    if (!BOT_TOKEN) {
        console.error('❌ Нет BOT_TOKEN');
        return;
    }

    const body = {
        chat_id: chatId,
        text,
        // Без parse_mode — работает всегда
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

// ============ POST ============
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
        // ==================== CALLBACK ====================
        if (update.callback_query) {
            const cb = update.callback_query;
            const chatId = cb.message.chat.id;
            const data = cb.data;

            console.log('🔘 Callback:', data);

            // Снять "часики"
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
                await sendMessage(chatId, TEXT_CONTACTS, contactsKeyboard);
            } else if (data === 'address') {
                await sendMessage(chatId, TEXT_ADDRESS, addressKeyboard);
            } else if (data === 'menu') {
                await sendMessage(chatId, TEXT_MENU, menuKeyboard);
            }

            return NextResponse.json({ ok: true });
        }

        // ==================== MESSAGE ====================
        if (update.message) {
            const msg = update.message;
            const chatId = msg.chat.id;
            const text = (msg.text || '').trim();
            const lower = text.toLowerCase();
            const cmd = lower.replace(/^\//, '');

            console.log('💬 Text:', text, '| cmd:', cmd);

            // /start
            if (cmd === 'start' || cmd.startsWith('start')) {
                await sendMessage(chatId, TEXT_START, mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            // Меню
            if (cmd === 'menu' || cmd.includes('menu') || lower.includes('меню')) {
                await sendMessage(chatId, TEXT_MENU, menuKeyboard);
                return NextResponse.json({ ok: true });
            }

            // Контакты
            if (cmd === 'contacts' || lower.includes('контакт')) {
                await sendMessage(chatId, TEXT_CONTACTS, contactsKeyboard);
                return NextResponse.json({ ok: true });
            }

            // Адрес
            if (
                cmd === 'address' ||
                lower.includes('адрес') ||
                lower.includes('где вы') ||
                lower.includes('локац')
            ) {
                await sendMessage(chatId, TEXT_ADDRESS, addressKeyboard);
                return NextResponse.json({ ok: true });
            }

            // О нас
            if (cmd === 'about' || lower.includes('о нас') || lower.includes('инфо')) {
                await sendMessage(chatId, TEXT_ABOUT, mainKeyboard);
                return NextResponse.json({ ok: true });
            }

            // Помощь
            if (cmd === 'help' || lower.includes('помощ') || lower.includes('команд')) {
                await sendMessage(
                    chatId,
                    '📋 Команды бота\n\n' +
                    '/start — главное меню\n' +
                    '/menu — меню кофейни\n' +
                    '/contacts — контакты\n' +
                    '/address — адрес\n' +
                    '/about — о нас',
                    mainKeyboard
                );
                return NextResponse.json({ ok: true });
            }

            // Fallback
            await sendMessage(
                chatId,
                'Здравствуйте! 👋\n\n' +
                'Я бот кофейни Qahva Bukhara.\n' +
                'Помогу узнать меню, контакты и адрес.\n\n' +
                'Нажмите кнопки ниже:',
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

// ============ GET ============
export async function GET() {
    return NextResponse.json({
        ok: true,
        message: 'Qahva Telegram webhook is running',
        version: '7.0',
        hasToken: !!BOT_TOKEN,
        contacts: CONTACTS,
    });
}