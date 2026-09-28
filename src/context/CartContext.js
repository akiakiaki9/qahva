'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const saved = localStorage.getItem('qahva-cart');
            if (saved) setCart(JSON.parse(saved));
        } catch { }
    }, []);

    useEffect(() => {
        if (mounted) localStorage.setItem('qahva-cart', JSON.stringify(cart));
    }, [cart, mounted]);

    const add = (item, size) => {
        const key = `${item.id}-${size || 'default'}`;
        setCart((prev) => {
            const existing = prev.find((p) => p.key === key);
            if (existing) {
                return prev.map((p) => (p.key === key ? { ...p, qty: p.qty + 1 } : p));
            }
            return [
                ...prev,
                {
                    key,
                    id: item.id,
                    title: item.title,
                    image: item.image,
                    size: size || null,
                    price: item.price,
                    qty: 1,
                },
            ];
        });
    };

    const remove = (key) => setCart((prev) => prev.filter((p) => p.key !== key));
    const inc = (key) =>
        setCart((prev) => prev.map((p) => (p.key === key ? { ...p, qty: p.qty + 1 } : p)));
    const dec = (key) =>
        setCart((prev) =>
            prev.map((p) => (p.key === key ? { ...p, qty: p.qty - 1 } : p)).filter((p) => p.qty > 0)
        );
    const clear = () => setCart([]);

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const count = cart.reduce((s, i) => s + i.qty, 0);

    return (
        <CartContext.Provider
            value={{ cart, add, remove, inc, dec, clear, total, count, isOpen, setIsOpen }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);