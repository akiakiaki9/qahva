'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import Menu from '@/components/Menu';
import ProductModal from '@/components/ProductModal';
import Cart from '@/components/Cart';
import OrderForm from '@/components/OrderForm';
import Footer from '@/components/Footer';
import FloatingCart from '@/components/FloatingCart';

export default function Home() {
  const [activeCat, setActiveCat] = useState('black');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderOpen, setOrderOpen] = useState(false);

  return (
    <>
      <Header />
      <Hero />

      <section className="section menu-section" id="menu">
        <div className="section-head">
          <div>
            <h2 className="section-title">
              Наше <em>меню</em>
            </h2>
            <p className="section-sub">
              Свежеобжаренный кофе и десерты ручной работы каждый день
            </p>
          </div>
        </div>

        <Categories active={activeCat} setActive={setActiveCat} />
        <Menu active={activeCat} onOpen={setSelectedProduct} />
      </section>

      <Footer />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <Cart onCheckout={() => setOrderOpen(true)} />
      {orderOpen && <OrderForm onClose={() => setOrderOpen(false)} />}
      <FloatingCart />
    </>
  );
}