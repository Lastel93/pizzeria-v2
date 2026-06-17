export const metadata = {
  title: 'Pizzeria Da Mario',
  description: 'Ordina la tua pizza via WhatsApp',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, backgroundColor: '#0a0a0a' }}>{children}</body>
    </html>
  )
}
