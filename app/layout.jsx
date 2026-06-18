// app/layout.js
import { RestaurantProvider } from '@/context/RestaurantContext';
import './globals.css';

export const metadata = {
  title: 'Pizzeria Hub Admin',
  description: 'Gestione menu e ordini',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="antialiased">
        <RestaurantProvider>
          {/* Qui verrà renderizzato il contenuto delle tue pagine */}
          <main>
            {children}
          </main>
        </RestaurantProvider>
      </body>
    </html>
  );
}
