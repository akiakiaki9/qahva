'use client';

import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { categories } from '@/data/menu';

const PLACEHOLDER = '/images/placeholder.png';
const fmt = (n) => (n > 0 ? n.toLocaleString('ru-RU') + ' сум' : 'По запросу');

export default function ProductModal({ product, onClose }) {
    const { add, setIsOpen } = useCart();
    const [size, setSize] = useState(null);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        if (product) {
            setSize(product.sizes ? product.sizes[1] || product.sizes[0] : null);
            setQty(1);
            document.body.style.overflow = 'hidden';
        }
        return () => { document.body.style.overflow = ''; };
    }, [product]);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    if (!product) return null;

    const catName = categories.find((c) => c.id === product.cat)?.name || '';
    const priceMultiplier = size && product.sizes
        ? product.sizes.indexOf(size) * 0.15 + 1
        : 1;
    const unitPrice = Math.round(product.price * priceMultiplier);
    const totalPrice = unitPrice * qty;

    const handleAdd = () => {
        for (let i = 0; i < qty; i++) add({ ...product, price: unitPrice }, size);
        onClose();
        setIsOpen(true);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Закрыть">
                    <FiX />
                </button>

                <div className="modal-visual">
                    <img
                        src={product.image || PLACEHOLDER}
                        alt={product.title}
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                    />
                </div>

                <div className="modal-body">
                    <div className="modal-cat">{catName}</div>
                    <h2 className="modal-title">{product.title}</h2>
                    <p className="modal-desc">{product.desc}</p>

                    {product.sizes && (
                        <div className="modal-options">
                            <div className="modal-options-label">Размер</div>
                            <div className="size-options">
                                {product.sizes.map((s) => (
                                    <button
                                        key={s}
                                        className={`size-opt ${size === s ? 'active' : ''}`}
                                        onClick={() => setSize(s)}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="modal-options">
                        <div className="modal-options-label">Количество</div>
                        <div className="qty-ctrl" style={{ width: 'fit-content' }}>
                            <button className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                                <FiMinus />
                            </button>
                            <span className="qty-num">{qty}</span>
                            <button className="qty-btn" onClick={() => setQty((q) => q + 1)}>
                                <FiPlus />
                            </button>
                        </div>
                    </div>

                    <div className="modal-bottom">
                        <div className="modal-price">
                            <small>Итого</small>
                            <span>{fmt(totalPrice)}</span>
                        </div>
                        <button className="modal-add" onClick={handleAdd}>
                            <FiPlus /> В корзину
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}