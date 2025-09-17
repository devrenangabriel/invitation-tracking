"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface Props {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }

    if (adminOnly) {
      if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        setAuthorized(true);
      } else {
        router.replace("/home");
      }
    } else {
      setAuthorized(true);
    }
  }, [user, loading, adminOnly, router]);

  if (loading || !authorized) {
    return <p className="text-center mt-20">Carregando...</p>;
  }

  return <>{children}</>;
}
