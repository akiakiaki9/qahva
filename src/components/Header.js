'use client';

import { FiShoppingBag, FiInstagram, FiSend, FiPhone } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';

export default function Header() {
    const { count, setIsOpen } = useCart();

    return (
        <header className="header">
            <div className="header-inner">
                <a href="#" className="logo" aria-label="Qahva Bukhara">
                    <img src="/images/icon.png" alt="Qahva Bukhara" className="logo-img" />
                    <span className="logo-text">
                        Qahva<span className="logo-dot">.</span>
                    </span>
                </a>

                <nav className="header-nav">
                    <a href="#menu">Меню</a>
                    <a href="#about">О нас</a>
                    <a href="#contacts">Контакты</a>
                </nav>

                <div className="header-actions">
                    <a href="tel:+998997020030" className="icon-btn phone" aria-label="Позвонить">
                        <FiPhone />
                    </a>
                    <a
                        href="https://www.instagram.com/qahva.bukhara/"
                        target="_blank"
                        rel="noreferrer"
                        className="icon-btn instagram"
                        aria-label="Instagram"
                    >
                        <FiInstagram />
                    </a>
                    <a
                        href="https://t.me/qahvabukhara_bot"
                        target="_blank"
                        rel="noreferrer"
                        className="icon-btn telegram"
                        aria-label="Telegram"
                    >
                        <FiSend />
                    </a>
                    <button
                        className="icon-btn cart"
                        onClick={() => setIsOpen(true)}
                        aria-label="Корзина"
                    >
                        <FiShoppingBag />
                        {count > 0 && <span className="cart-badge">{count}</span>}
                    </button>
                </div>
            </div>
        </header>
    );
}