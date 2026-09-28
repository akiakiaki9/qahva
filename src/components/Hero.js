'use client';

import { FiArrowRight, FiClock, FiStar } from 'react-icons/fi';

export default function Hero() {
    return (
        <section className="hero">
            <div>
                <div className="hero-badge">
                    <span className="dot" />
                    Работаем 24/7 · Бухара
                </div>

                <h1>
                    Место, где кофе<br />
                    встречается <em>с искусством</em>
                </h1>

                <p>
                    Кофейня Qahva — сладкие моменты в каждом десерте
                    и идеальный кофе в любое время суток.
                </p>

                <div className="hero-actions">
                    <a href="#menu" className="btn btn-primary">
                        Смотреть меню <FiArrowRight />
                    </a>
                    <a
                        href="https://t.me/qahvabukhara_bot"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline"
                    >
                        Telegram-бот
                    </a>
                </div>
            </div>

            <div className="hero-visual">
                <img
                    src="/images/hero.png"
                    alt="Кофейня Qahva"
                    loading="lazy"
                />
                <div className="hero-floating f1">
                    <FiClock /> Открыто 24/7
                </div>
                <div className="hero-floating f2">
                    <FiStar /> Лучший кофе в Бухаре
                </div>
            </div>
        </section>
    );
}