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
          content: `Sei un esperto di digitalizzazione menù. Estrai piatti e prezzi da questa foto.
          Restituisci ESCLUSIVAMENTE un JSON con questa struttura: 
          { "menuItems": [{ "name": "...", "description": "...", "price": 0.00, "category": "..." }] }
          Usa solo queste categorie: "Pizze Classiche", "Pizze Speciali", "Bibite", "Birre Artigianali".`
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

    return NextResponse.json(JSON.parse(response.choices[0].message.content));
  } catch (error) {
    return NextResponse.json({ error: "Errore nella scansione" }, { status: 500 });
  }
}
