// app/api/directions/route.js
import { NextResponse } from "next/server";

/**
 * Manipulador da rota GET para buscar direções entre dois pontos usando a API do Google Maps.
 *
 * Esta função recebe parâmetros de consulta (`origin` e `destination`) na URL da requisição
 * e utiliza a Google Maps Directions API para obter informações sobre o trajeto, incluindo
 * distância e duração. 
 *
 * Caso os parâmetros obrigatórios não sejam fornecidos ou a chave da API não esteja configurada,
 * a função retorna um erro apropriado.
 *
 * @param {Request} request - Objeto da requisição HTTP contendo os parâmetros da URL.
 * @returns {Promise<NextResponse>} Resposta JSON com a distância e duração do trajeto,
 * ou uma mensagem de erro em caso de falha.
 *
 * Exemplo de uso:
 * GET /api/directions?origin=São+Paulo&destination=Campinas
 * Retorna: { "distance": "98,3 km", "duration": 5400 }
 */

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
      const duration = route.duration.value; // Ex: "1800" (em segundos)

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
