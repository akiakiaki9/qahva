'use client';

import { useRef, useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { categories } from '@/data/menu';

const CATEGORY_FALLBACK = '/images/category.png';

export default function Categories({ active, setActive }) {
    const ref = useRef(null);
    const stickyRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isStuck, setIsStuck] = useState(false);

    const updateArrows = () => {
        const el = ref.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setCanScrollLeft(scrollLeft > 4);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    };

    useEffect(() => {
        updateArrows();
        const el = ref.current;
        if (!el) return;
        el.addEventListener('scroll', updateArrows, { passive: true });
        window.addEventListener('resize', updateArrows);
        return () => {
            el.removeEventListener('scroll', updateArrows);
            window.removeEventListener('resize', updateArrows);
        };
    }, []);

    // Детект «прилипания»
    useEffect(() => {
        const el = stickyRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') return;

        const sentinel = document.createElement('div');
        sentinel.style.position = 'absolute';
        sentinel.style.top = '0';
        sentinel.style.height = '1px';
        sentinel.style.width = '100%';
        sentinel.style.pointerEvents = 'none';

        el.parentElement.style.position = 'relative';
        el.parentElement.insertBefore(sentinel, el);

        const observer = new IntersectionObserver(
            ([entry]) => setIsStuck(!entry.isIntersecting),
            { threshold: 0, rootMargin: '0px 0px 0px 0px' }
        );
        observer.observe(sentinel);

        return () => {
            observer.disconnect();
            sentinel.remove();
        };
    }, []);

    const scrollBy = (dir) => {
        if (ref.current) {
            ref.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
        }
    };

    return (
        <div
            ref={stickyRef}
            className={`menu-categories-sticky ${isStuck ? 'is-stuck' : ''}`}
        >
            <div className="categories-wrap">
                <button
                    className={`cat-arrow cat-arrow-left ${canScrollLeft ? 'visible' : ''}`}
                    onClick={() => scrollBy(-1)}
                    aria-label="Прокрутить влево"
                    type="button"
                >
                    <FiChevronLeft />
                </button>

                <div className={`cat-fade cat-fade-left ${canScrollLeft ? 'visible' : ''}`} />

                <div className="categories" ref={ref}>
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            className={`category-card ${active === c.id ? 'active' : ''}`}
                            onClick={() => setActive(c.id)}
                        >
                            <div className="category-card-img">
                                <img
                                    src={c.image || CATEGORY_FALLBACK}
                                    alt={c.name}
                                    loading="lazy"
                                    onError={(e) => { e.currentTarget.src = CATEGORY_FALLBACK; }}
                                />
                            </div>
                            <span className="category-card-name">{c.name}</span>
                        </button>
                    ))}
                </div>

                <div className={`cat-fade cat-fade-right ${canScrollRight ? 'visible' : ''}`} />

                <button
                    className={`cat-arrow cat-arrow-right ${canScrollRight ? 'visible' : ''}`}
                    onClick={() => scrollBy(1)}
                    aria-label="Прокрутить вправо"
                    type="button"
                >
                    <FiChevronRight />
                </button>
            </div>
        </div>
    );
}