import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';
const BOT_USERNAME = 'qahvabukhara_bot';

const fmt = (n) => (n > 0 ? n.toLocaleString('ru-RU') + ' сум' : 'По запросу');

async function tgSend(chatId, text, extra = {}) {
    if (!BOT_TOKEN) {
        console.error('❌ Нет BOT_TOKEN');
        return { ok: false, error: 'no token' };
    }

    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                // БЕЗ parse_mode — работает всегда
                ...extra,
            }),
        });
        const data = await res.json();
        if (!data.ok) {
            console.error('❌ tgSend FAILED:', JSON.stringify(data));
        } else {
            console.log('✅ tgSend OK, msg_id:', data.result?.message_id);
        }
        return data;
    } catch (err) {
        console.error('❌ tgSend error:', err.message);
        return { ok: false, error: err.message };
    }
}

export async function POST(req) {
    console.log('🚀 POST /api/order');

    try {
        const body = await req.json();
        const { cart, total, name, phone, location } = body;

        console.log('📦 Заказ:', {
            name,
            phone,
            items: cart?.length,
            total,
            hasLocation: !!location,
        });

        if (!cart?.length) {
            return NextResponse.json({ ok: false, error: 'Cart is empty' }, { status: 400 });
        }
        if (!name || !phone) {
            return NextResponse.json(
                { ok: false, error: 'Name and phone required' },
                { status: 400 }
            );
        }

        const now = new Date();
        const orderId = `Q-${Date.now().toString().slice(-6)}`;

        // ============ ТЕКСТ ДЛЯ АДМИНА (без Markdown) ============
        let adminText = `🛒 Новый заказ Qahva\n`;
        adminText += `🆔 ${orderId}\n`;
        adminText += `🕐 ${now.toLocaleString('ru-RU')}\n`;
        adminText += `━━━━━━━━━━━━━━━\n\n`;

        adminText += `👤 Имя: ${name}\n`;
        adminText += `📞 Телефон: ${phone}\n`;

        if (location?.lat && location?.lng) {
            const yandexMap = `https://yandex.ru/maps/?pt=${location.lng},${location.lat}&z=17&l=map`;
            adminText += `📍 Локация: ${yandexMap}\n`;
            adminText += `   Координаты: ${location.lat}, ${location.lng} (±${location.accuracy}м)\n`;
        } else {
            adminText += `📍 Локация: не определена\n`;
        }

        adminText += `\n━━━━━━━━━━━━━━━\n`;
        adminText += `📋 Состав заказа:\n\n`;
        cart.forEach((i) => {
            adminText += `• ${i.title}${i.size ? ` (${i.size})` : ''} × ${i.qty} — ${fmt(i.price * i.qty)}\n`;
        });

        adminText += `\n━━━━━━━━━━━━━━━\n`;
        adminText += `💰 Итого: ${fmt(total)}`;

        // ============ КНОПКИ ДЛЯ АДМИНА ============
        const phoneRaw = String(phone).replace(/\D/g, '');
        const adminButtons = {
            inline_keyboard: [
                [
                    { text: '💬 Написать клиенту в TG', url: `https://t.me/+${phoneRaw}` },
                ],
            ],
        };

        // ============ ОТПРАВКА АДМИНУ ============
        let adminSent = false;
        let adminError = null;

        if (BOT_TOKEN && ADMIN_CHAT_ID) {
            console.log('📤 Отправка админу:', ADMIN_CHAT_ID);
            const adminRes = await tgSend(ADMIN_CHAT_ID, adminText, {
                reply_markup: adminButtons,
            });
            adminSent = adminRes.ok === true;
            if (!adminSent) adminError = adminRes.description || 'unknown error';
            console.log('📤 Результат:', adminSent ? 'успех' : `ошибка: ${adminError}`);
        } else {
            console.warn('⚠️ BOT_TOKEN или ADMIN_CHAT_ID пустые');
        }

        // ============ ССЫЛКА НА БОТА ДЛЯ КЛИЕНТА ============
        const startPayload = encodeURIComponent(`order_${orderId}_${total}`);

        return NextResponse.json({
            ok: true,
            orderId,
            adminSent,
            adminError,
            botUrl: `https://t.me/${BOT_USERNAME}?start=${startPayload}`,
        });
    } catch (err) {
        console.error('❌ Order error:', err.message);
        console.error('❌ Stack:', err.stack);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        ok: true,
        message: 'Qahva order API',
        version: '2.0',
        hasToken: !!BOT_TOKEN,
        hasAdmin: !!ADMIN_CHAT_ID,
    });
}