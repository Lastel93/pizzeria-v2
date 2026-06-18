'use client';
import { useState } from 'react';
import { useRestaurant } from '../../../context/RestaurantContext';
import { supabase } from '../../../lib/supabase';

export default function Dashboard() {
  const { restaurant, loading } = useRestaurant();
  const [formData, setFormData] = useState({ name: '', address: '', description: '' });

  const handleCreate = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('restaurants')
      .insert([{ ...formData, owner_id: user.id }])
      .select();

    if (error) {
      alert("Errore: " + error.message);
    } else {
      window.location.reload(); 
    }
  };

  if (loading) return <div>Caricamento...</div>;

  if (restaurant) {
    return (
      <div className="p-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Gestione {restaurant.name}</h1>
        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <p><strong>Indirizzo:</strong> {restaurant.address || 'Non impostato'}</p>
          <p><strong>Descrizione:</strong> {restaurant.description || 'Nessuna'}</p>
          {/* Qui in futuro aggiungeremo il tasto per caricare il menu */}
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Configura la tua Pizzeria</h2>
      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <input 
          type="text" placeholder="Nome della pizzeria" required
          className="border p-3 rounded-lg"
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        <input 
          type="text" placeholder="Indirizzo (es. Via Roma 1, Milano)" required
          className="border p-3 rounded-lg"
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
        <textarea 
          placeholder="Una breve descrizione (es. Pizza napoletana a lievitazione naturale)"
          className="border p-3 rounded-lg"
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
        <button type="submit" className="bg-[#1C2D21] text-white p-3 rounded-lg font-bold">
          Salva Configurazione
        </button>
      </form>
    </div>
  );
}
