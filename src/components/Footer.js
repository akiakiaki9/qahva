import { FiPhone, FiInstagram, FiSend, FiMapPin, FiClock } from 'react-icons/fi';

export default function Footer() {
    return (
        <footer className="footer" id="contacts">
            <div className="footer-inner">
                <div className="footer-brand">
                    <h3>QAHVA<span>.</span></h3>
                    <p>
                        Кофейня в Бухаре, где кофе встречается с искусством,
                        а каждый десерт — сладкий момент.
                    </p>
                </div>

                <div className="footer-col">
                    <h4>Контакты</h4>
                    <a href="tel:+998997020030" className="f-phone">
                        <FiPhone /> +998 99 702 00 30
                    </a>
                    <a
                        href="https://t.me/qahvabukhara_bot"
                        target="_blank"
                        rel="noreferrer"
                        className="f-telegram"
                    >
                        <FiSend /> Telegram Bot
                    </a>
                    <a
                        href="https://www.instagram.com/qahva.bukhara/"
                        target="_blank"
                        rel="noreferrer"
                        className="f-instagram"
                    >
                        <FiInstagram /> @qahva.bukhara
                    </a>
                </div>

                <div className="footer-col">
                    <h4>Информация</h4>
                    <p><FiMapPin /> Бухара, Узбекистан</p>
                    <p><FiClock /> Круглосуточно · 24/7</p>
                </div>
            </div>

            <div className="footer-bottom">
                <div>© {new Date().getFullYear()} Qahva Bukhara. Все права защищены.</div>
                <div>
                    Разработано в{' '}
                    <a
                        href="https://www.akbarsoft.uz"
                        target="_blank"
                        rel="noreferrer"
                        className="footer-credit"
                    >
                        Akbar Soft
                    </a>
                </div>
            </div>
        </footer>
    );
}