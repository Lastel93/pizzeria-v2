import './globals.css'

export const metadata = {
  title: 'Pizzeria dai Burini - Menu Digitale',
  description: 'Le nostre pizze artigianali direttamente a casa tua',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
