'use client';
import { useRestaurant } from '../../../context/RestaurantContext';

export default function Dashboard() {
  const { restaurant, loading } = useRestaurant();

  if (loading) return <div>Caricamento...</div>;
  if (!restaurant) return <div>Non ho trovato alcun ristorante associato al tuo profilo.</div>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Dashboard di {restaurant.name}</h1>
      <p>Benvenuto nell'area riservata.</p>
    </div>
  );
}
