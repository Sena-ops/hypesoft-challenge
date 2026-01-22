"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import Keycloak from "keycloak-js";
import {
  getKeycloakInstance,
  keycloakInitOptions,
  parseKeycloakUser,
  hasRole,
  hasAnyRole,
  KeycloakUser,
} from "@/lib/keycloak";

// Timeout para inicialização do Keycloak (10 segundos)
const KEYCLOAK_INIT_TIMEOUT = 10000;
// Timeout para health check (3 segundos)
const KEYCLOAK_HEALTH_CHECK_TIMEOUT = 3000;

/**
 * Verifica se o Keycloak está acessível
 */
const checkKeycloakHealth = async (): Promise<boolean> => {
  const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080";
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "nexus";
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), KEYCLOAK_HEALTH_CHECK_TIMEOUT);
    
    // Tenta acessar a configuração do realm
    const response = await fetch(
      `${keycloakUrl}/realms/${realm}/.well-known/openid-configuration`,
      { 
        signal: controller.signal,
        mode: 'cors',
      }
    );
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn("Keycloak health check failed:", error);
    return false;
  }
};

/**
 * Interface do contexto de autenticação Keycloak
 */
interface KeycloakContextType {
  keycloak: Keycloak | null;
  user: KeycloakUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isKeycloakAvailable: boolean;
  token: string | null;
  login: () => void;
  logout: () => void;
  register: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  updateToken: (minValidity?: number) => Promise<boolean>;
}

const KeycloakContext = createContext<KeycloakContextType>({
  keycloak: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isKeycloakAvailable: false,
  token: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  hasRole: () => false,
  hasAnyRole: () => false,
  updateToken: async () => false,
});

/**
 * Hook para acessar o contexto de autenticação Keycloak
 */
export const useKeycloak = () => useContext(KeycloakContext);

/**
 * Provider de autenticação Keycloak
 * Gerencia o ciclo de vida da autenticação com o Keycloak
 */
export const KeycloakProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [user, setUser] = useState<KeycloakUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isKeycloakAvailable, setIsKeycloakAvailable] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const initialized = useRef(false);
  const router = useRouter();

  // Inicializa o Keycloak
  useEffect(() => {
    // Previne múltiplas inicializações (React StrictMode)
    if (initialized.current) return;
    initialized.current = true;

    const initKeycloak = async () => {
      try {
        // Primeiro verifica se o Keycloak está acessível
        console.log("Verificando disponibilidade do Keycloak...");
        const isHealthy = await checkKeycloakHealth();
        
        if (!isHealthy) {
          console.warn("Keycloak não está disponível");
          setIsKeycloakAvailable(false);
          setIsLoading(false);
          return;
        }

        console.log("Keycloak disponível, inicializando...");
        const keycloakInstance = getKeycloakInstance();

        // Configura callback de atualização de token
        keycloakInstance.onTokenExpired = () => {
          console.log("Token expirado, atualizando...");
          keycloakInstance
            .updateToken(30)
            .then((refreshed) => {
              if (refreshed) {
                setToken(keycloakInstance.token || null);
                console.log("Token atualizado com sucesso");
              }
            })
            .catch(() => {
              console.warn("Falha ao atualizar token, redirecionando para login");
              keycloakInstance.login();
            });
        };

        // Callback quando autenticação muda
        keycloakInstance.onAuthSuccess = () => {
          console.log("Autenticação bem-sucedida!");
          const userData = parseKeycloakUser(keycloakInstance);
          setUser(userData);
          setToken(keycloakInstance.token || null);
        };

        keycloakInstance.onAuthLogout = () => {
          console.log("Logout realizado");
          setUser(null);
          setToken(null);
        };

        keycloakInstance.onAuthError = (error) => {
          console.error("Erro de autenticação:", error);
        };

        keycloakInstance.onAuthRefreshError = () => {
          console.error("Erro ao atualizar autenticação");
        };

        // Inicializa o Keycloak com timeout
        console.log("Iniciando Keycloak.init()...");
        const initPromise = keycloakInstance.init(keycloakInitOptions);
        const timeoutPromise = new Promise<boolean>((_, reject) => {
          setTimeout(() => reject(new Error("Keycloak init timeout")), KEYCLOAK_INIT_TIMEOUT);
        });

        const authenticated = await Promise.race([initPromise, timeoutPromise]);
        console.log("Keycloak.init() completado. Autenticado:", authenticated);

        setKeycloak(keycloakInstance);
        setIsKeycloakAvailable(true);

        if (authenticated) {
          console.log("Usuário autenticado, processando token...");
          const userData = parseKeycloakUser(keycloakInstance);
          console.log("Dados do usuário:", userData);
          setUser(userData);
          setToken(keycloakInstance.token || null);
        }

        setIsLoading(false);
        console.log("Inicialização completa. isLoading: false");
      } catch (error) {
        console.error("Erro ao inicializar Keycloak:", error);
        setIsKeycloakAvailable(false);
        setIsLoading(false);
      }
    };

    initKeycloak();
  }, []);

  // Configura atualização automática do token
  useEffect(() => {
    if (!keycloak || !keycloak.authenticated) return;

    // Atualiza o token a cada 60 segundos
    const interval = setInterval(() => {
      keycloak
        .updateToken(70)
        .then((refreshed) => {
          if (refreshed) {
            setToken(keycloak.token || null);
          }
        })
        .catch(() => {
          console.warn("Sessão expirada");
        });
    }, 60000);

    return () => clearInterval(interval);
  }, [keycloak]);

  /**
   * Redireciona para a página de login do Keycloak
   */
  const login = useCallback(() => {
    if (keycloak) {
      keycloak.login({
        redirectUri: window.location.origin + "/dashboard",
      });
    }
  }, [keycloak]);

  /**
   * Faz logout e redireciona para a página inicial
   */
  const logout = useCallback(() => {
    if (keycloak) {
      keycloak.logout({
        redirectUri: window.location.origin,
      });
    }
  }, [keycloak]);

  /**
   * Redireciona para a página de registro do Keycloak
   */
  const register = useCallback(() => {
    if (keycloak) {
      keycloak.register({
        redirectUri: window.location.origin + "/dashboard",
      });
    }
  }, [keycloak]);

  /**
   * Verifica se o usuário tem uma role específica
   */
  const checkRole = useCallback(
    (role: string): boolean => {
      if (!keycloak) return false;
      return hasRole(keycloak, role);
    },
    [keycloak]
  );

  /**
   * Verifica se o usuário tem qualquer uma das roles
   */
  const checkAnyRole = useCallback(
    (roles: string[]): boolean => {
      if (!keycloak) return false;
      return hasAnyRole(keycloak, roles);
    },
    [keycloak]
  );

  /**
   * Atualiza o token manualmente
   */
  const updateToken = useCallback(
    async (minValidity: number = 30): Promise<boolean> => {
      if (!keycloak) return false;
      try {
        const refreshed = await keycloak.updateToken(minValidity);
        if (refreshed) {
          setToken(keycloak.token || null);
        }
        return refreshed;
      } catch {
        return false;
      }
    },
    [keycloak]
  );

  return (
    <KeycloakContext.Provider
      value={{
        keycloak,
        user,
        isAuthenticated: !!keycloak?.authenticated,
        isLoading,
        isKeycloakAvailable,
        token,
        login,
        logout,
        register,
        hasRole: checkRole,
        hasAnyRole: checkAnyRole,
        updateToken,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
};
