'use client';

import {
    FiPhone,
    FiInstagram,
    FiSend,
    FiMapPin,
    FiClock,
    FiNavigation,
} from 'react-icons/fi';

const CONTACTS = {
    phone: '+998 99 702 00 30',
    phoneRaw: '+998997020030',
    telegram: 'https://t.me/qahvabukhara_bot',
    instagram: 'https://www.instagram.com/qahva.bukhara/',
    address: 'Бухара, улица Хофиз Таниша Бухорий, 10',
    // Координаты Qahva (замени на точные)
    lat: 39.769977,
    lng: 64.429131,
    hours: 'Круглосуточно · 24/7',
};

// Яндекс.Карты через конструктор (без API-ключа)
// ll = долгота,широта, z = зум, pt = метка (долгота,широта)
const YANDEX_MAP_SRC = `https://yandex.ru/map-widget/v1/?ll=${CONTACTS.lng}%2C${CONTACTS.lat}&z=16&pt=${CONTACTS.lng},${CONTACTS.lat},pm2rdm&l=map`;

const YANDEX_LINK = `https://yandex.ru/maps/?pt=${CONTACTS.lng},${CONTACTS.lat}&z=17&l=map`;

export default function Contacts() {
    return (
        <section className="contacts" id="contacts">
            <div className="contacts-inner">
                {/* Левая колонка — информация */}
                <div className="contacts-info">
                    <div className="contacts-head">
                        <span className="contacts-badge">
                            <span className="dot" />
                            Открыто сейчас · 24/7
                        </span>
                        <h2 className="contacts-title">
                            Как нас <em>найти</em>
                        </h2>
                        <p className="contacts-sub">
                            Заходите в любое время — мы работаем круглосуточно.
                            Свежий кофе, уютная атмосфера и десерты ждут вас.
                        </p>
                    </div>

                    <div className="contacts-list">
                        {/* Адрес */}
                        <a
                            href={YANDEX_LINK}
                            target="_blank"
                            rel="noreferrer"
                            className="contact-card"
                        >
                            <div className="contact-card-icon loc">
                                <FiMapPin />
                            </div>
                            <div className="contact-card-body">
                                <div className="contact-card-label">Адрес</div>
                                <div className="contact-card-value">{CONTACTS.address}</div>
                                <div className="contact-card-hint">Открыть на карте →</div>
                            </div>
                        </a>

                        {/* Телефон */}
                        <a
                            href={`tel:${CONTACTS.phoneRaw}`}
                            className="contact-card"
                        >
                            <div className="contact-card-icon phone">
                                <FiPhone />
                            </div>
                            <div className="contact-card-body">
                                <div className="contact-card-label">Телефон</div>
                                <div className="contact-card-value">{CONTACTS.phone}</div>
                                <div className="contact-card-hint">Нажмите, чтобы позвонить</div>
                            </div>
                        </a>

                        {/* Telegram */}
                        <a
                            href={CONTACTS.telegram}
                            target="_blank"
                            rel="noreferrer"
                            className="contact-card"
                        >
                            <div className="contact-card-icon tg">
                                <FiSend />
                            </div>
                            <div className="contact-card-body">
                                <div className="contact-card-label">Telegram</div>
                                <div className="contact-card-value">@qahvabukhara_bot</div>
                                <div className="contact-card-hint">Меню и заказы</div>
                            </div>
                        </a>

                        {/* Instagram */}
                        <a
                            href={CONTACTS.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="contact-card"
                        >
                            <div className="contact-card-icon ig">
                                <FiInstagram />
                            </div>
                            <div className="contact-card-body">
                                <div className="contact-card-label">Instagram</div>
                                <div className="contact-card-value">@qahva.bukhara</div>
                                <div className="contact-card-hint">Свежие новости и фото</div>
                            </div>
                        </a>

                        {/* Часы */}
                        <div className="contact-card static">
                            <div className="contact-card-icon hours">
                                <FiClock />
                            </div>
                            <div className="contact-card-body">
                                <div className="contact-card-label">Часы работы</div>
                                <div className="contact-card-value">{CONTACTS.hours}</div>
                                <div className="contact-card-hint">Без выходных</div>
                            </div>
                        </div>
                    </div>

                    <a
                        href={YANDEX_LINK}
                        target="_blank"
                        rel="noreferrer"
                        className="contacts-route-btn"
                    >
                        <FiNavigation /> Построить маршрут
                    </a>
                </div>

                {/* Правая колонка — карта */}
                <div className="contacts-map">
                    <iframe
                        src={YANDEX_MAP_SRC}
                        title="Qahva Bukhara на карте"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>
        </section>
    );
}