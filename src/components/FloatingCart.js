'use client';

import { FiShoppingBag } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';

export default function FloatingCart() {
    const { count, setIsOpen } = useCart();
    if (count === 0) return null;

    return (
        <button
            className="fab-cart"
            onClick={() => setIsOpen(true)}
            aria-label="Открыть корзину"
        >
            <FiShoppingBag />
            <span className="cart-badge">{count}</span>
        </button>
    );
}