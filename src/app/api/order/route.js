import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';
const BOT_USERNAME = 'qahvabukhara_bot';

const fmt = (n) => (n > 0 ? n.toLocaleString('ru-RU') + ' сум' : 'По запросу');

export async function POST(req) {
    try {
        const { cart, total, name, phone, location } = await req.json();

        if (!cart?.length) {
            return NextResponse.json({ ok: false, error: 'Cart is empty' }, { status: 400 });
        }
        if (!name || !phone) {
            return NextResponse.json({ ok: false, error: 'Name and phone required' }, { status: 400 });
        }

        // === Текст для админа ===
        let text = '🛒 *Новый заказ Qahva*\n\n';
        text += `🕐 ${new Date().toLocaleString('ru-RU')}\n\n`;
        text += `👤 *Имя:* ${name}\n`;
        text += `📞 *Телефон:* ${phone}\n`;

        if (location?.lat && location?.lng) {
            // Яндекс.Карты: https://yandex.ru/maps/?pt=lon,lat&z=17&l=map
            // ВАЖНО: у Яндекса порядок lon,lat (долгота, широта) — обратный Google
            const yandexMapUrl = `https://yandex.ru/maps/?pt=${location.lng},${location.lat}&z=17&l=map`;
            text += `📍 *Локация:* [открыть на Яндекс.Картах](${yandexMapUrl})\n`;
            text += `   \`${location.lat}, ${location.lng}\` (точность ±${location.accuracy}м)\n`;
        } else {
            text += `📍 *Локация:* не определена\n`;
        }

        text += `\n📋 *Состав заказа:*\n`;
        cart.forEach((i) => {
            text += `• ${i.title}${i.size ? ` (${i.size})` : ''} × ${i.qty} — ${fmt(i.price * i.qty)}\n`;
        });
        text += `\n💰 *Итого: ${fmt(total)}*`;

        // === Отправка админу в Telegram ===
        if (BOT_TOKEN && ADMIN_CHAT_ID) {
            const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
            const tgRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: ADMIN_CHAT_ID,
                    text,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: false,
                }),
            });
            const tgData = await tgRes.json();
            if (!tgData.ok) {
                console.error('Telegram error:', tgData);
            }
        } else {
            console.warn('TELEGRAM_BOT_TOKEN или TELEGRAM_ADMIN_CHAT_ID не настроены');
        }

        const startPayload = encodeURIComponent(`order_${Date.now()}_${total}`);

        return NextResponse.json({
            ok: true,
            botUrl: `https://t.me/${BOT_USERNAME}?start=${startPayload}`,
            message: 'Order sent',
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ ok: true, message: 'Qahva order API' });
}