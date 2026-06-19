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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: "Sei un esperto di digitalizzazione menu. Ritorna SEMPRE un JSON valido con chiave 'menu' contenente un array di oggetti {name, description, price, category}. Se non trovi nulla, ritorna {\"menu\": []}."
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: "Estrai i piatti da questo menu. Usa il formato JSON. Prezzo come stringa (es '5.00/8.00'), se non c'è metti '0'. Non aggiungere spiegazioni extra." },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ]
      })
    });

    const aiData = await response.json();
    if (!aiData.choices) throw new Error("Risposta IA non valida");

    const content = aiData.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '');
    const parsedContent = JSON.parse(content);

    return NextResponse.json(parsedContent.menu || []);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
