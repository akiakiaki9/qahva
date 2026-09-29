import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';

export async function GET() {
    const hasToken = !!BOT_TOKEN;
    const tokenPreview = BOT_TOKEN
        ? `${BOT_TOKEN.slice(0, 10)}...${BOT_TOKEN.slice(-4)} (length: ${BOT_TOKEN.length})`
        : null;

    // 1. Проверяем токен через getMe
    let getMeResult = null;
    if (hasToken) {
        try {
            const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
            getMeResult = await res.json();
        } catch (err) {
            getMeResult = { error: String(err) };
        }
    }

    // 2. Пробуем отправить сообщение админу
    let sendResult = null;
    if (hasToken && ADMIN_CHAT_ID) {
        try {
            const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: ADMIN_CHAT_ID,
                    text: '🧪 DEBUG: тест от Qahva бота',
                }),
            });
            sendResult = await res.json();
        } catch (err) {
            sendResult = { error: String(err) };
        }
    }

    return NextResponse.json({
        hasToken,
        tokenPreview,
        adminChatId: ADMIN_CHAT_ID || null,
        getMeResult,
        sendResult,
        diagnosis: {
            step1_token: hasToken ? '✅ токен есть' : '❌ токена НЕТ',
            step2_getMe: getMeResult?.ok ? '✅ токен валидный' : '❌ токен НЕвалидный',
            step3_send: sendResult?.ok ? '✅ сообщения уходят' : '❌ отправка падает',
        },
    });
}