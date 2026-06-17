import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="bg-[#fdfcf7] antialiased m-0 p-0">{children}</body>
    </html>
  )
}
