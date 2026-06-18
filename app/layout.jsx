// app/layout.jsx
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
          <main>
            {children}
          </main>
        </RestaurantProvider>
      </body>
    </html>
  );
}
