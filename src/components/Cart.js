'use client';

import { FiX, FiPlus, FiMinus, FiSend, FiTrash2 } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';

const PLACEHOLDER = '/images/placeholder.png';
const fmt = (n) => (n > 0 ? n.toLocaleString('ru-RU') + ' сум' : 'По запросу');

export default function Cart({ onCheckout }) {
    const { cart, isOpen, setIsOpen, inc, dec, remove, clear, total, count } = useCart();

    if (!isOpen) return null;

    return (
        <>
            <div className="cart-overlay" onClick={() => setIsOpen(false)} />
            <aside className="cart-panel">
                <div className="cart-header">
                    <h3>
                        Корзина {count > 0 && <span>{count}</span>}
                    </h3>
                    <button className="icon-btn cart" onClick={() => setIsOpen(false)}>
                        <FiX />
                    </button>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="cart-empty">
                            <div className="cart-empty-icon">🛒</div>
                            <p>Корзина пуста</p>
                            <p style={{ fontSize: 13, marginTop: 8 }}>Добавьте что-нибудь из меню</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.key} className="cart-item">
                                <div className="cart-item-img">
                                    <img
                                        src={item.image || PLACEHOLDER}
                                        alt={item.title}
                                        onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                                    />
                                </div>
                                <div className="cart-item-info">
                                    <div className="cart-item-title">{item.title}</div>
                                    {item.size && <div className="cart-item-size">{item.size}</div>}
                                    <div className="cart-item-foot">
                                        <div className="cart-item-price">{fmt(item.price * item.qty)}</div>
                                        <div className="qty-ctrl">
                                            <button className="qty-btn" onClick={() => dec(item.key)}>
                                                <FiMinus />
                                            </button>
                                            <span className="qty-num">{item.qty}</span>
                                            <button className="qty-btn" onClick={() => inc(item.key)}>
                                                <FiPlus />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span className="cart-total-label">Итого</span>
                            <span className="cart-total-value">{fmt(total)}</span>
                        </div>

                        <div className="cart-actions">
                            <button
                                className="cart-btn primary"
                                onClick={() => {
                                    setIsOpen(false);
                                    onCheckout();
                                }}
                            >
                                <FiSend /> Оформить заказ
                            </button>
                            <button className="cart-btn ghost" onClick={clear}>
                                <FiTrash2 /> Очистить корзину
                            </button>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}