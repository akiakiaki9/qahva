'use client';

import { FiPlus } from 'react-icons/fi';
import { menu } from '@/data/menu';

const fmt = (n) => (n > 0 ? n.toLocaleString('ru-RU') + ' сум' : 'По запросу');
const PLACEHOLDER = '/images/placeholder.png';

export default function Menu({ active, onOpen }) {
    const items = menu.filter((m) => m.cat === active);

    return (
        <div className="menu-grid">
            {items.map((item, i) => (
                <div
                    key={item.id}
                    className="menu-card"
                    onClick={() => onOpen(item)}
                    style={{ animationDelay: `${i * 30}ms` }}
                >
                    <div className="menu-card-img">
                        {item.badge && <div className="menu-card-badge">{item.badge}</div>}
                        <img
                            src={item.image || PLACEHOLDER}
                            alt={item.title}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                        />
                    </div>
                    <div className="menu-card-body">
                        <div className="menu-card-title">{item.title}</div>
                        <div className="menu-card-desc">{item.desc}</div>
                        <div className="menu-card-foot">
                            <div className="menu-card-price">{fmt(item.price)}</div>
                            <button
                                className="menu-card-add"
                                onClick={(e) => { e.stopPropagation(); onOpen(item); }}
                                aria-label="Подробнее"
                            >
                                <FiPlus />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}