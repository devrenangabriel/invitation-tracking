"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface Props {
  children: ReactNode;
  adminOnly?: boolean;
}

/**
 * Componente que protege uma rota, garantindo que apenas usuários autenticados (e opcionalmente, apenas administradores) possam acessá-la.
 * Enquanto a verificação de autenticação ocorre, exibe uma mensagem de carregamento.
 * Se o usuário não estiver autorizado, ele é redirecionado.
 *
 * @param {Props} props As propriedades do componente.
 * @param {ReactNode} props.children O conteúdo ou componente a ser renderizado se o acesso for autorizado.
 * @param {boolean} [props.adminOnly=false] Se definido como `true`, a rota só será acessível pelo usuário administrador.
 * @returns {JSX.Element | null} Renderiza o conteúdo (`children`) se o usuário estiver autorizado, caso contrário, exibe "Carregando...".
 */
export default function ProtectedRoute({ children, adminOnly }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Aguarda o fim do carregamento do estado de autenticação
    if (loading) return;

    // Se não houver usuário logado, redireciona para a página inicial
    if (!user) {
      router.replace("/");
      return;
    }

    // Se a rota é exclusiva para administradores
    if (adminOnly) {
      // Verifica se o email do usuário corresponde ao do admin
      if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        setAuthorized(true);
      } else {
        // Se não for o admin, redireciona para uma página segura (ex: home)
        router.replace("/home");
      }
    } else {
      // Se a rota não é exclusiva para admin, autoriza qualquer usuário logado
      setAuthorized(true);
    }
  }, [user, loading, adminOnly, router]);

  // Exibe uma mensagem de carregamento enquanto a autorização está pendente
  if (loading || !authorized) {
    return <p className="text-center mt-20">Carregando...</p>;
  }

  // Se o usuário estiver autorizado, renderiza o conteúdo da rota
  return <>{children}</>;
}
