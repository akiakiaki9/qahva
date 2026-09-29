import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';
const BOT_USERNAME = 'qahvabukhara_bot';

const fmt = (n) => (n > 0 ? n.toLocaleString('ru-RU') + ' сум' : 'По запросу');

// ============ Telegram helper ============
async function tgSend(chatId, text, extra = {}) {
    if (!BOT_TOKEN) return { ok: false, error: 'No bot token' };

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: 'Markdown',
                disable_web_page_preview: false,
                ...extra,
            }),
        });
        const data = await res.json();
        if (!data.ok) console.error('Telegram error:', data);
        return data;
    } catch (err) {
        console.error('Telegram fetch error:', err);
        return { ok: false, error: String(err) };
    }
}

export async function POST(req) {
    try {
        const { cart, total, name, phone, location } = await req.json();

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
        const phoneRaw = String(phone).replace(/\D/g, '');

        // ============================================
        // ТЕКСТ ДЛЯ АДМИНА
        // ============================================
        let adminText = `🛒 *Новый заказ Qahva*\n`;
        adminText += `🆔 \`${orderId}\`\n`;
        adminText += `🕐 ${now.toLocaleString('ru-RU')}\n`;
        adminText += `━━━━━━━━━━━━━━━━━━\n\n`;

        adminText += `👤 *Имя:* ${name}\n`;
        adminText += `📞 *Телефон:* ${phone}\n`;

        if (location?.lat && location?.lng) {
            // Яндекс: порядок lon,lat (обратный Google)
            const yandexMapUrl = `https://yandex.ru/maps/?pt=${location.lng},${location.lat}&z=17&l=map`;
            adminText += `📍 *Локация:* [открыть на Яндекс.Картах](${yandexMapUrl})\n`;
            adminText += `   \`${location.lat}, ${location.lng}\` (точность ±${location.accuracy}м)\n`;
        } else {
            adminText += `📍 *Локация:* не определена\n`;
        }

        adminText += `\n━━━━━━━━━━━━━━━━━━\n`;
        adminText += `📋 *Состав заказа:*\n\n`;
        cart.forEach((i) => {
            const line = `• ${i.title}${i.size ? ` _(${i.size})_` : ''} × ${i.qty}`;
            adminText += `${line} — *${fmt(i.price * i.qty)}*\n`;
        });

        adminText += `\n━━━━━━━━━━━━━━━━━━\n`;
        adminText += `💰 *Итого: ${fmt(total)}*`;

        // Inline-кнопки для админа
        const adminButtons = {
            inline_keyboard: [
                [
                    { text: '📞 Позвонить', url: `tel:+${phoneRaw}` },
                    { text: '💬 Написать в TG', url: `https://t.me/${phoneRaw}` },
                ],
            ],
        };

        // ============================================
        // ТЕКСТ ДЛЯ КЛИЕНТА (подтверждение)
        // ============================================
        let clientText = `✅ *Заказ принят!*\n\n`;
        clientText += `🆔 Заказ: \`${orderId}\`\n`;
        clientText += `🕐 ${now.toLocaleString('ru-RU')}\n\n`;

        clientText += `📋 *Состав:*\n`;
        cart.forEach((i) => {
            clientText += `• ${i.title}${i.size ? ` (${i.size})` : ''} × ${i.qty} — ${fmt(i.price * i.qty)}\n`;
        });
        clientText += `\n💰 *Итого: ${fmt(total)}*\n\n`;
        clientText += `📞 Мы свяжемся с вами по номеру *${phone}* для подтверждения.\n`;
        clientText += `Спасибо, что выбрали Qahva ☕`;

        // ============================================
        // ОТПРАВКА В TELEGRAM
        // ============================================
        let adminSent = false;

        if (BOT_TOKEN && ADMIN_CHAT_ID) {
            // 1. Админу
            const adminRes = await tgSend(ADMIN_CHAT_ID, adminText, {
                reply_markup: adminButtons,
            });
            adminSent = adminRes.ok === true;

            // 2. Клиенту в бот (если он когда-либо писал боту — chat_id известен)
            // Попробуем отправить клиенту по его chat_id = его user id (если он писал боту)
            // Но у нас его нет. Поэтому отправляем через callback/deep-link.
        } else {
            console.warn('⚠️ TELEGRAM_BOT_TOKEN или TELEGRAM_ADMIN_CHAT_ID не настроены');
        }

        // ============================================
        // BOT LINK ДЛЯ КЛИЕНТА
        // ============================================
        const startPayload = encodeURIComponent(`order_${orderId}_${total}`);

        return NextResponse.json({
            ok: true,
            orderId,
            adminSent,
            botUrl: `https://t.me/${BOT_USERNAME}?start=${startPayload}`,
            message: 'Order sent',
        });
    } catch (err) {
        console.error('Order error:', err);
        return NextResponse.json(
            { ok: false, error: 'Server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ ok: true, message: 'Qahva order API' });
}