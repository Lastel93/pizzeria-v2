'use client';
import { useState } from 'react';
import { useRestaurant } from '../../../context/RestaurantContext';
import { supabase } from '../../../lib/supabase';

export default function Dashboard() {
  const { restaurant, loading } = useRestaurant();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');

  // Funzione per salvare la nuova pizzeria
  const handleCreate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('restaurants')
      .insert([{ name, owner_id: user.id }]);

    if (error) {
      alert("Errore: " + error.message);
    } else {
      window.location.reload(); // Ricarica per mostrare la dashboard
    }
  };

  if (loading) return <div>Caricamento...</div>;

  // CASO 1: Il ristorante esiste
  if (restaurant) {
    return (
      <div className="p-10">
        <h1 className="text-3xl font-bold">Dashboard di {restaurant.name}</h1>
        <p>Benvenuto nella tua area gestione.</p>
      </div>
    );
  }

  // CASO 2: Il ristorante NON esiste -> Mostriamo il modulo di creazione
  return (
    <div className="p-10 flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-bold mb-4">Non hai ancora una pizzeria!</h2>
      <input 
        type="text" 
        placeholder="Nome della tua pizzeria" 
        className="border p-2 rounded mb-4 w-64"
        onChange={(e) => setName(e.target.value)}
      />
      <button 
        onClick={handleCreate}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        Crea la mia Pizzeria
      </button>
    </div>
  );
}
