'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSend, FiMapPin, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';

const fmt = (n) => n.toLocaleString('ru-RU') + ' сум';

export default function OrderForm({ onClose }) {
    const { cart, total, clear } = useCart();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState(null); // { lat, lng, accuracy }
    const [locStatus, setLocStatus] = useState('idle'); // idle | loading | success | error
    const [locError, setLocError] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    // Автозапрос геолокации при открытии
    useEffect(() => {
        requestLocation();
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocStatus('error');
            setLocError('Геолокация не поддерживается');
            return;
        }
        setLocStatus('loading');
        setLocError('');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({
                    lat: pos.coords.latitude.toFixed(6),
                    lng: pos.coords.longitude.toFixed(6),
                    accuracy: Math.round(pos.coords.accuracy),
                });
                setLocStatus('success');
            },
            (err) => {
                setLocStatus('error');
                setLocError(
                    err.code === 1 ? 'Доступ к геолокации запрещён'
                        : err.code === 2 ? 'Не удалось определить локацию'
                            : 'Превышено время ожидания'
                );
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    const validatePhone = (v) => /^[\d\s+\-()]{7,}$/.test(v.trim());

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !validatePhone(phone)) return;
        if (locStatus !== 'success') {
            requestLocation();
            return;
        }

        setSending(true);
        try {
            const res = await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart,
                    total,
                    name: name.trim(),
                    phone: phone.trim(),
                    location,
                }),
            });
            const data = await res.json();
            if (data.ok) {
                setSent(true);
                clear();
                // Открываем Telegram-бота клиенту
                setTimeout(() => {
                    window.open(data.botUrl || 'https://t.me/qahvabukhara_bot', '_blank');
                    onClose();
                }, 1500);
            } else {
                alert('Ошибка: ' + (data.error || 'Не удалось отправить'));
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка сети. Попробуйте ещё раз.');
        } finally {
            setSending(false);
        }
    };

    if (sent) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="order-modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                    <h2>Заказ отправлен!</h2>
                    <p className="order-sub" style={{ marginBottom: 0 }}>
                        Мы получили ваш заказ.<br />Сейчас откроется Telegram-бот для подтверждения.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="order-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Закрыть">
                    <FiX />
                </button>

                <h2>Оформление заказа</h2>
                <p className="order-sub">
                    Заполните данные — мы свяжемся с вами для подтверждения
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label>Ваше имя *</label>
                        <input
                            type="text"
                            placeholder="Например, Азиз"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            minLength={2}
                        />
                    </div>

                    <div className="form-field">
                        <label>Телефон *</label>
                        <input
                            type="tel"
                            placeholder="+998 99 123 45 67"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    {/* Блок геолокации */}
                    <div className={`location-box ${locStatus}`}>
                        {locStatus === 'loading' && <FiLoader style={{ animation: 'spin 1s linear infinite' }} />}
                        {locStatus === 'success' && <FiCheckCircle />}
                        {locStatus === 'error' && <FiAlertCircle />}
                        {locStatus === 'idle' && <FiMapPin />}

                        <div className="loc-text">
                            {locStatus === 'idle' && 'Определение локации...'}
                            {locStatus === 'loading' && 'Определяем вашу локацию...'}
                            {locStatus === 'success' && (
                                <>
                                    Локация определена
                                    <span className="loc-coords">
                                        {location.lat}, {location.lng} · ±{location.accuracy}м
                                    </span>
                                </>
                            )}
                            {locStatus === 'error' && (
                                <>
                                    {locError || 'Ошибка локации'}
                                    <span className="loc-coords">Нажмите, чтобы повторить</span>
                                </>
                            )}
                        </div>

                        {locStatus === 'error' && (
                            <button
                                type="button"
                                onClick={requestLocation}
                                style={{
                                    color: 'var(--brown)', fontWeight: 700, fontSize: 13,
                                    padding: '6px 12px', borderRadius: 20,
                                    background: 'rgba(165,102,71,0.1)',
                                }}
                            >
                                Ещё раз
                            </button>
                        )}
                    </div>

                    {/* Сводка заказа */}
                    <div className="order-summary">
                        {cart.map((i) => (
                            <div key={i.key} className="order-summary-row">
                                <span>{i.title}{i.size ? ` (${i.size})` : ''} × {i.qty}</span>
                                <span>{fmt(i.price * i.qty)}</span>
                            </div>
                        ))}
                        <div className="order-summary-total">
                            <span>Итого</span>
                            <span>{fmt(total)}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="order-submit"
                        disabled={sending || !name.trim() || !validatePhone(phone)}
                    >
                        <FiSend /> {sending ? 'Отправка...' : 'Отправить заказ'}
                    </button>

                    <p className="order-note">
                        Заказ уйдёт администратору в Telegram. Оплата — при получении.
                    </p>
                </form>
            </div>

            <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}