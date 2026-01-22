import axios from "axios";
import { getKeycloakInstance } from "@/lib/keycloak";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Obtém o token de acesso atual do Keycloak
 * Tenta atualizar o token se estiver próximo de expirar
 */
const getAccessToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  try {
    const keycloak = getKeycloakInstance();

    if (!keycloak.authenticated) {
      return null;
    }

    // Atualiza o token se expirar em menos de 30 segundos
    const refreshed = await keycloak.updateToken(30);
    if (refreshed) {
      console.log("Token atualizado automaticamente");
    }

    return keycloak.token || null;
  } catch {
    console.warn("Erro ao obter token do Keycloak");
    return null;
  }
};

// Interceptor de request para adicionar o token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    // Só executa no cliente (browser)
    if (typeof window !== "undefined") {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se receber 401 e não for uma retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        try {
          const keycloak = getKeycloakInstance();

          // Tenta atualizar o token
          const refreshed = await keycloak.updateToken(30);

          if (refreshed && keycloak.token) {
            // Refaz a requisição com o novo token
            originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
            return api(originalRequest);
          }
        } catch {
          // Se não conseguir atualizar, redireciona para login
          const keycloak = getKeycloakInstance();
          keycloak.login();
        }
      }
    }

    // Se receber 403 (Forbidden), não redireciona, apenas retorna o erro
    if (error.response?.status === 403) {
      console.warn("Acesso negado: permissão insuficiente");
    }

    return Promise.reject(error);
  }
);
