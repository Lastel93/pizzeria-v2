'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Percorso relativo

const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_id', user.id)
          .single();
        setRestaurant(data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <RestaurantContext.Provider value={{ restaurant, loading }}>
      {children}
    </RestaurantContext.Provider>
  );
}
export const useRestaurant = () => useContext(RestaurantContext);
