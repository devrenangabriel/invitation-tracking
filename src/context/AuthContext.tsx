"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

/**
 * Provedor de autenticação que envolve a aplicação e fornece o contexto de autenticação.
 * @param {ReactNode} props.children - Os componentes filhos que terão acesso ao contexto.
 * @returns {JSX.Element} O provedor de contexto com o estado de autenticação.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Realiza o login do usuário administrador com uma conta Google via popup.
   * Verifica se o email logado corresponde ao email do administrador.
   * @throws {Error} Lança um erro se o usuário que tenta logar não for o administrador.
   * @returns {Promise<void>} Uma promessa que é resolvida quando o login é bem-sucedido ou a verificação falha.
   */
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const email = result.user.email;
    if (email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      await signOut(auth);
      throw new Error(
        "Acesso negado. Apenas o administrador pode entrar com Google."
      );
    }
  };

  /**
   * Realiza o login do usuário com email e senha.
   * @param {string} email - O email do usuário para login.
   * @param {string} password - A senha do usuário para login.
   * @returns {Promise<void>} Uma promessa que é resolvida quando o login é bem-sucedido.
   */
  const loginWithEmailPassword = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Realiza o logout do usuário atualmente autenticado.
   * @returns {Promise<void>} Uma promessa que é resolvida quando o logout é concluído.
   */
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithGoogle, loginWithEmailPassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook customizado para acessar o contexto de autenticação.
 * Deve ser usado dentro de um componente que seja filho de `AuthProvider`.
 * @throws {Error} Lança um erro se o hook for usado fora de um `AuthProvider`.
 * @returns {AuthContextProps} O valor do contexto, contendo o usuário, estado de carregamento e funções de autenticação.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
