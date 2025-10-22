// app/api/directions/route.js
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!origin || !destination) {
    return NextResponse.json(
      { error: 'Parâmetros "origin" e "destination" são obrigatórios' },
      { status: 400 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "Chave da API do Google Maps não configurada" },
      { status: 500 }
    );
  }

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "OK") {
      const route = data.routes[0].legs[0];
      const distance = route.distance.text; // Ex: "21,4 km"
      const duration = route.duration.text; // Ex: "23 minutos"

      return NextResponse.json({ distance, duration });
    } else {
      return NextResponse.json(
        { error: data.error_message || "Erro ao buscar direções" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
