'use client';

import { useEffect } from 'react';
import { FiX, FiPhone } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';

const PHONE = '+998 99 702 00 30';
const PHONE_LINK = 'tel:+998997020030';
const fmt = (n) => n.toLocaleString('ru-RU') + ' сум';

export default function OrderForm({ onClose }) {
    const { cart, total } = useCart();

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="order-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Закрыть">
                    <FiX />
                </button>

                <h2>Состав заказа</h2>
                <p className="order-sub">Позвоните нам, чтобы оформить заказ</p>

                <div className="order-summary">
                    {cart.map((item) => (
                        <div key={item.key} className="order-summary-row">
                            <span>{item.title}{item.size ? ` (${item.size})` : ''} × {item.qty}</span>
                            <span>{fmt(item.price * item.qty)}</span>
                        </div>
                    ))}
                    <div className="order-summary-total">
                        <span>Итого</span>
                        <span>{fmt(total)}</span>
                    </div>
                </div>

                <a className="order-call" href={PHONE_LINK}>
                    <FiPhone />
                    <span>
                        <small>Нажмите, чтобы позвонить</small>
                        {PHONE}
                    </span>
                </a>
            </div>
        </div>
    );
}
