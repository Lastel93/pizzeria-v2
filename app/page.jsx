'use client';
import { useRestaurant } from '../context/RestaurantContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { restaurant, loading } = useRestaurant();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !restaurant) {
      router.push('/login');
    }
  }, [restaurant, loading, router]);

  if (loading) return <div>Caricamento in corso...</div>;

  return (
    <div>
      <h1>Benvenuto in {restaurant?.name}</h1>
      <p>Questa pagina ora è parametrica: mostra solo la pizzeria di chi è loggato.</p>
    </div>
  );
}
