import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: "URL mancante" }, { status: 400 });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Passaggio a gpt-4o per una Vision superiore
        temperature: 0,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: `Sei un esperto di trascrizione menu. Il tuo unico compito è ESTRARRE LETTERALMENTE ogni riga di testo che rappresenta un piatto o una bevanda nell'immagine, senza ometterne nessuna.
            REGOLE FERREE:
            1. Scansiona l'immagine in modo sistematico: dall'alto verso il basso, colonna per colonna.
            2. Non riassumere: ogni singola voce visibile va trascritta.
            3. Raggruppa le voci estratte in categorie logiche (es: 'Antipasti', 'Pizze Rosse', 'Pizze Bianche', 'Bevande', 'Dolci').
            4. Se il prezzo non è leggibile, usa stringa vuota "".
            5. Se la descrizione non è presente, usa stringa vuota "".
            6. Mantieni i nomi piatti esattamente come scritti.
            Ritorna SOLO questo JSON: {"menu": [{"category": "Nome Categoria", "items": [{"name": "...", "description": "...", "price": "..."}]}]}`
          },
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: "Trascrivi ogni singola voce del menu in questa immagine, raggruppata per categoria. Non saltare nulla. Se non trovi nulla, ritorna {\"menu\": []}." 
              },
              { 
                type: 'image_url', 
                image_url: { url: imageUrl, detail: 'high' } 
              }
            ]
          }
        ]
      })
    });

    const aiData = await response.json();
    if (!aiData.choices?.[0]?.message?.content) {
      throw new Error("Risposta IA non valida o vuota");
    }

    const content = aiData.choices[0].message.content;
    const parsedContent = JSON.parse(content);

    return NextResponse.json(parsedContent.menu || []);
  } catch (error) {
    console.error("Errore estrazione menu:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
