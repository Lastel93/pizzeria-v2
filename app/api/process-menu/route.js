import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { image } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Sei un esperto di digitalizzazione menù. Analizza l'immagine e raggruppa i prodotti in categorie.
          Restituisci ESCLUSIVAMENTE un JSON strutturato così:
          {
            "menu": [
              {
                "category": "Nome Categoria",
                "items": [
                  {
                    "name": "Nome Piatto",
                    "description": "Breve descrizione",
                    "variations": [{"type": "Prezzo Base", "price": 0.00}],
                    "extra": {}
                  }
                ]
              }
            ]
          }
          Se trovi più prezzi per lo stesso piatto (es. Trancio/Teglia), mettili tutti nell'array 'variations'.`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analizza questa foto:" },
            { type: "image_url", image_url: { url: image } }
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const parsedData = JSON.parse(response.choices[0].message.content);
    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Errore API:", error);
    return NextResponse.json({ error: "Errore nella scansione" }, { status: 500 });
  }
}
