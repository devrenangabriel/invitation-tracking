"use client";

import { useEffect, useState } from "react";
import { getEventos, Evento } from "@/lib/firebaseEvents";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EventsPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEventos() {
      try {
        const data = await getEventos();
        setEventos(data);
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEventos();
  }, []);

  if (loading) return <p>Carregando...</p>;
  return (
    <div>
      <Button
        variant={"outline"}
        className="w-full h-16 justify-start text-xl"
        asChild
      >
        <Link href="/eventos/novo">Cadastrar Novo evento</Link>
      </Button>

      <ul className="space-y-2 pt-4">
        {eventos.map((evento) => (
          <li key={evento.id} className="p-4 border rounded">
            <Link href={`/eventos/${evento.id}`}>
              <strong>{evento.nome}</strong> — {evento.local} <br />
              <span className="text-sm text-muted-foreground">
                {evento.data.toLocaleDateString("pt-BR")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
