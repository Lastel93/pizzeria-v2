'use client';

import React, { useState } from 'react';

const restaurantData = {
  name: "Pizzeria Da Mario",
  phone_whatsapp: "393331234567", // Sostituisci con il tuo numero reale
  address: "Via Roma 10, Torino",
  description: "La vera pizza napoletana a lunga lievitazione, direttamente a casa tua.",
  cover_image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070"
};

const categories = ["Le Classiche", "Le Speciali", "Bevande"];

const menuItems = [
  { id: 1, category: "Le Classiche", name: "Margherita", description: "Pomodoro, mozzarella fiordilatte, basilico fresco, olio EVO", price: 6.50 },
  { id: 2, category: "Le Classiche", name: "Diavola", description: "Pomodoro, mozzarella, salame piccante calabrese", price: 8.00 },
  { id: 3, category: "Le Speciali", name: "Burrata e Pistacchio", description: "Mozzarella, mortadella, burrata pugliese, granella di pistacchio", price: 11.00 },
  { id: 4, category: "Bevande", name: "Birra Artigianale", description: "Bionda locale 33cl", price: 4.50 }
];

export default function Page() {
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const generateWhatsAppLink = (itemName, itemPrice) => {
    const text = `Ciao! Vorrei ordinare dalla Pizzeria: 1x ${itemName} (€${itemPrice.toFixed(2)})`;
    return `https://wa.me/${restaurantData.phone_whatsapp}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div style={{ color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '60px' }}>
      
      {/* Hero Header */}
      <div style={{ position: 'relative', height: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), #0a0a0a), url(${restaurantData.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>{restaurantData.name}</h1>
          <p style={{ fontSize: '1.2rem', color: '#ccc', margin: '0 0 5px 0' }}>{restaurantData.description}</p>
          <p style={{ fontSize: '0.9rem', color: '#aaa', margin: 0 }}>📍 {restaurantData.address}</p>
        </div>
      </div>

      {/* Menu Principale */}
      <div style={{ maxWidth: '600px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* Categorie Tabs */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px', overflowX: 'auto' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', background: activeCategory === cat ? '#fff' : '#222', color: activeCategory === cat ? '#000' : '#fff', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Lista Piatti */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {menuItems.filter(item => item.category === activeCategory).map(item => (
            <div key={item.id} style={{ background: '#161616', padding: '20px', borderRadius: '15px', border: '1px solid #262626', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{item.name}</h3>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#999', lineHeight: '1.4' }}>{item.description}</p>
                <span style={{ fontSize: '1.1rem', color: '#10b981', fontWeight: 'bold' }}>€{item.price.toFixed(2)}</span>
              </div>
              <div>
                <a
                  href={generateWhatsAppLink(item.name, item.price)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', background: '#10b981', color: '#fff', padding: '10px 16px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
                >
                  Ordina →
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
