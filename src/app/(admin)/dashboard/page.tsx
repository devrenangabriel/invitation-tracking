"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrajetoStatus, Convidado } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [totalEventos, setTotalEventos] = useState(0);
  const [totalConvidados, setTotalConvidados] = useState(0);
  const [percentuaisStatus, setPercentuaisStatus] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    async function carregarDados() {
      try {
        // 1️⃣ Buscar todos os eventos
        const eventosSnap = await getDocs(collection(db, "eventos"));
        const eventos = eventosSnap.docs;

        setTotalEventos(eventos.length);

        // 2️⃣ Buscar todos os convidados (subcoleções)
        let todosConvidados: Convidado[] = [];

        for (const evento of eventos) {
          const convidadosRef = collection(
            db,
            "eventos",
            evento.id,
            "convidados"
          );
          const convidadosSnap = await getDocs(convidadosRef);
          const convidados = convidadosSnap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Convidado, "id">),
          }));
          todosConvidados = [...todosConvidados, ...convidados];
        }

        setTotalConvidados(todosConvidados.length);

        // 3️⃣ Calcular percentuais de status (último trajeto de cada convidado)
        const contagemStatus: Record<string, number> = {};
        todosConvidados.forEach((c) => {
          const ultimo = c.trajeto?.[c.trajeto.length - 1];
          if (ultimo?.status) {
            contagemStatus[ultimo.status] =
              (contagemStatus[ultimo.status] || 0) + 1;
          }
        });

        const percentuais: Record<string, number> = {};
        Object.entries(contagemStatus).forEach(([status, qtd]) => {
          percentuais[status] = Math.round(
            (qtd / todosConvidados.length) * 100
          );
        });

        setPercentuaisStatus(percentuais);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando informações...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 py-10 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Painel do Admin</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visão geral dos eventos e convidados
          </p>
        </header>

        {/* 🔹 Cards de resumo */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Total de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{totalEventos}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total de Convidados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {totalConvidados}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Confirmados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-500">
                {percentuaisStatus[TrajetoStatus.CONFIRMADO] ?? 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Finalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-500">
                {percentuaisStatus[TrajetoStatus.FINALIZADO] ?? 0}%
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 🔸 Distribuição completa dos status */}
        <section className="mt-10 bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Distribuição por Status
          </h2>
          {Object.keys(percentuaisStatus).length === 0 ? (
            <p className="text-gray-500">Nenhum convidado encontrado.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 text-center gap-4">
              {Object.entries(percentuaisStatus).map(([status, perc]) => (
                <div key={status} className="space-y-2">
                  <p className="font-medium text-sm">{status}</p>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${perc}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{perc}%</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
