import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;  
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: AuthUser | null;
  token: string | null;
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  token: null,
  setIsLoggedIn: () => {},
  setUser: () => {},
  setToken: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenStored = localStorage.getItem("token");
    const userStored = localStorage.getItem("user");

    if (tokenStored && userStored) {
      try {
        const parsedUser: AuthUser = JSON.parse(userStored);
        setToken(tokenStored);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Erro ao fazer parse do usuário do localStorage", error);
        signOut();
      }
    }
  }, []);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user, token]);

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setTimeout(() => {
      router.push("/");
    }, 100);
  };   

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, token, setIsLoggedIn, setUser, setToken, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}