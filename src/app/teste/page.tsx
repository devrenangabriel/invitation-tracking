"use client";
import { useState } from "react";

export default function DistanceCalculator() {
  const [origin, setOrigin] = useState("-7.0733618,-41.4650645"); // Coords de São Paulo (exemplo)
  const [destination, setDestination] = useState("-7.078716, -41.432474"); // Coords do Rio de Janeiro (exemplo)
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDirections = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/directions?origin=${origin}&destination=${destination}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar dados");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Calculadora de Distância e Tempo</h2>
      <div>
        <label>
          Origem (lat,lng):
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Destino (lat,lng):
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </label>
      </div>
      <button onClick={getDirections} disabled={loading}>
        {loading ? "Calculando..." : "Calcular"}
      </button>

      {result && (
        <div>
          <h3>Resultado:</h3>
          <p>
            <strong>Distância:</strong> {result.distance}
          </p>
          <p>
            <strong>Tempo de Viagem (estimado):</strong> {result.duration}
          </p>
        </div>
      )}

      {error && <p style={{ color: "red" }}>Erro: {error}</p>}
    </div>
  );
}
