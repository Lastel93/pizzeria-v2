// context/RestaurantContext.js
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aggiungiamo un check per sicurezza
    if (!supabase) return; 

    async function fetchRestaurant() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('owner_id', user.id)
            .single();
            
          if (data) {
            setRestaurant(data);
          }
        }
      } catch (err) {
        console.error("Errore nel caricamento del ristorante:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, []);

  return (
    <RestaurantContext.Provider value={{ restaurant, setRestaurant, loading }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export const useRestaurant = () => useContext(RestaurantContext);
