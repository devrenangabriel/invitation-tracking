"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function HomeTeam() {
  const { user, logout } = useAuth();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 gap-6">
      <h1 className="text-2xl font-bold">Área da Equipe</h1>
      <p className="text-gray-700 dark:text-gray-300">
        Você está logado como membro da equipe
      </p>

      {user && (
        <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-white dark:bg-gray-900 shadow">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || "Usuário"}
              className="w-16 h-16 rounded-full"
            />
          )}
          <p className="font-semibold">{user.displayName || "Sem nome"}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      )}

      <Button variant="outline" onClick={logout}>
        Sair
      </Button>
    </main>
  );
}
