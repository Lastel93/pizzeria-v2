// context/RestaurantContext.js
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRestaurant() {
      // 1. Prendiamo l'utente corrente
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 2. Cerchiamo il ristorante associato all'ID dell'utente
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_id', user.id)
          .single();
          
        if (data) {
          setRestaurant(data);
        }
      }
      setLoading(false);
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
