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
        model: 'gpt-4o', // <-- step 1: testa qui, non su mini
        temperature: 0,
        max_tokens: 4096,
        response_format: { type: "json_object" }, // forza JSON valido, niente markdown fences
        messages: [
          {
            role: 'system',
            content: `Sei un esperto di trascrizione menu. Il tuo unico compito è ESTRARRE LETTERALMENTE ogni riga di testo che rappresenta un piatto o una bevanda nell'immagine, senza ometterne nessuna.

REGOLE FERREE:
1. Scansiona l'immagine in modo sistematico: dall'alto verso il basso, colonna per colonna se il menu è multi-colonna.
2. Non riassumere, non "scegliere i piatti più rappresentativi": ogni singola voce visibile va trascritta.
3. Se un'immagine ha più sezioni/colonne fisiche, trattale come blocchi separati e poi unisci.
4. Raggruppa le voci estratte in categorie logiche (es: 'Antipasti', 'Pizze Rosse', 'Pizze Bianche', 'Bevande', 'Dolci').
5. Se il prezzo non è leggibile, usa stringa vuota "" — non inventare e non saltare la voce.
6. Se la descrizione non è presente, usa stringa vuota "" — non inventarla.
7. Mantieni i nomi piatti esattamente come scritti (anche con eventuali errori di battitura originali).

Prima di restituire il JSON finale, conta mentalmente quante voci totali hai trovato nell'immagine e assicurati che il tuo array "items" combinato corrisponda a quel numero.

Ritorna SOLO questo JSON, nessun altro testo:
{"menu": [{"category": "Nome Categoria", "items": [{"name": "...", "description": "...", "price": "..."}]}]}`
          },
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: "Trascrivi ogni singola voce del menu in questa immagine, raggruppata per categoria. Non saltare nulla, anche se il testo è piccolo o parzialmente illeggibile. Se non trovi nulla, ritorna {\"menu\": []}." 
              },
              { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } } // <-- importante!
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
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseErr) {
      console.error("JSON malformato ricevuto:", content);
      throw new Error("L'IA ha restituito un JSON non valido");
    }

    const menu = parsedContent.menu || [];
    const totalItems = menu.reduce((sum, cat) => sum + (cat.items?.length || 0), 0);

    return NextResponse.json({ menu, meta: { totalItems } });

  } catch (error) {
    console.error("Errore menu extraction:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
