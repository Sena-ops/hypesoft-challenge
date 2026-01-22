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
 * Aguarda o token estar disponível se o usuário estiver autenticado
 */
const getAccessToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") {
    console.log("[getAccessToken] Executando no servidor, retornando null");
    return null;
  }

  try {
    const keycloak = getKeycloakInstance();
    
    console.log("[getAccessToken] Keycloak state:", {
      authenticated: keycloak.authenticated,
      hasToken: !!keycloak.token,
      tokenLength: keycloak.token?.length || 0
    });

    if (!keycloak.authenticated) {
      console.warn("[getAccessToken] Usuário não autenticado");
      return null;
    }

    // Se o token ainda não estiver disponível, aguarda até 5 segundos
    // Isso pode acontecer logo após o login quando o Keycloak ainda está processando
    if (!keycloak.token) {
      console.log("Token não disponível, aguardando...");
      let attempts = 0;
      const maxAttempts = 50; // 5 segundos (50 * 100ms)
      
      while (!keycloak.token && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
        
        // Tenta atualizar o token a cada 3 tentativas (mais frequente)
        if (attempts % 3 === 0 && keycloak.authenticated) {
          try {
            const refreshed = await keycloak.updateToken(30);
            if (refreshed && keycloak.token) {
              console.log("Token obtido após atualização durante espera");
              break; // Token obtido, sai do loop
            }
          } catch (err) {
            console.warn("Erro ao tentar atualizar token durante espera:", err);
          }
        }
      }
      
      // Se ainda não tiver token após aguardar, tenta uma última vez
      if (!keycloak.token && keycloak.authenticated) {
        console.log("Tentando obter token uma última vez...");
        try {
          const refreshed = await keycloak.updateToken(30);
          if (refreshed && keycloak.token) {
            console.log("Token obtido após tentativa final de atualização");
          } else if (keycloak.token) {
            console.log("Token disponível sem necessidade de refresh");
          }
        } catch (err) {
          console.warn("Erro na tentativa final de obter token:", err);
        }
      }
      
      // Se ainda não tiver token após aguardar, retorna null
      if (!keycloak.token) {
        console.warn("Token não disponível após aguardar 5 segundos. Authenticated:", keycloak.authenticated);
        return null;
      }
      
      console.log("Token obtido com sucesso após aguardar");
    }

    // Atualiza o token se expirar em menos de 30 segundos
    try {
      const refreshed = await keycloak.updateToken(30);
      if (refreshed) {
        console.log("[getAccessToken] Token atualizado automaticamente");
      }
    } catch (error) {
      console.warn("[getAccessToken] Erro ao atualizar token:", error);
      // Mesmo com erro, tenta retornar o token se estiver disponível
    }

    const finalToken = keycloak.token || null;
    if (finalToken) {
      console.log(`[getAccessToken] Token obtido com sucesso (${finalToken.length} caracteres)`);
    } else {
      console.warn("[getAccessToken] Token final é null mesmo após todas as tentativas");
    }
    
    return finalToken;
  } catch (error) {
    console.warn("Erro ao obter token do Keycloak:", error);
    return null;
  }
};

// Interceptor de request para adicionar o token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    // Só executa no cliente (browser)
    if (typeof window !== "undefined") {
      try {
        const token = await getAccessToken();
        if (token) {
          // Garante que o header Authorization está definido corretamente
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`[API] Token adicionado ao header para ${config.method?.toUpperCase()} ${config.url?.substring(0, 50)}`);
        } else {
          console.warn(`[API] ⚠️ Token não disponível para ${config.method?.toUpperCase()} ${config.url?.substring(0, 50)}`);
          // Verifica se o usuário está autenticado
          try {
            const keycloak = getKeycloakInstance();
            console.warn(`[API] Keycloak state - authenticated: ${keycloak.authenticated}, hasToken: ${!!keycloak.token}, tokenParsed: ${!!keycloak.tokenParsed}`);
            
            // Se estiver autenticado mas sem token, tenta forçar uma atualização
            if (keycloak.authenticated && !keycloak.token) {
              console.log("[API] Tentando forçar atualização do token...");
              try {
                await keycloak.updateToken(30);
                if (keycloak.token) {
                  config.headers = config.headers || {};
                  config.headers.Authorization = `Bearer ${keycloak.token}`;
                  console.log("[API] Token obtido após atualização forçada");
                }
              } catch (updateError) {
                console.error("[API] Erro ao atualizar token:", updateError);
              }
            }
          } catch (keycloakError) {
            console.error("[API] Erro ao verificar Keycloak:", keycloakError);
          }
        }
      } catch (error) {
        console.error("[API] Erro ao obter token no interceptor:", error);
      }
    }
    return config;
  },
  (error) => {
    console.error("[API] Erro no interceptor de request:", error);
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

          // Se não estiver autenticado, redireciona para login
          if (!keycloak.authenticated) {
            console.warn("Usuário não autenticado, redirecionando para login");
            keycloak.login();
            return Promise.reject(error);
          }

          // Aguarda o token estar disponível se ainda não estiver
          if (!keycloak.token) {
            console.log("401 recebido e token não disponível, aguardando...");
            let attempts = 0;
            const maxAttempts = 50; // 5 segundos
            
            while (!keycloak.token && attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 100));
              attempts++;
              
              // Tenta atualizar o token a cada 3 tentativas (mais frequente)
              if (attempts % 3 === 0) {
                try {
                  const refreshed = await keycloak.updateToken(30);
                  if (refreshed && keycloak.token) {
                    console.log("Token obtido após atualização durante espera no 401");
                    break; // Token obtido, sai do loop
                  }
                } catch (err) {
                  console.warn("Erro ao tentar atualizar token durante espera no 401:", err);
                }
              }
            }
          }

          // Tenta atualizar o token
          const refreshed = await keycloak.updateToken(30);

          if (keycloak.token) {
            // Refaz a requisição com o token disponível
            originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
            return api(originalRequest);
          } else {
            // Se ainda não tiver token, redireciona para login
            console.warn("Token não disponível após tentativa de atualização, redirecionando para login");
            keycloak.login();
          }
        } catch (err) {
          console.error("Erro ao processar 401:", err);
          // Se não conseguir atualizar, redireciona para login
          const keycloak = getKeycloakInstance();
          keycloak.login();
        }
      }
    }

    // Se receber 403 (Forbidden), não redireciona, apenas retorna o erro
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Acesso negado: permissão insuficiente";
      console.warn("Acesso negado:", errorMessage);
      console.warn("Detalhes:", {
        status: error.response?.status,
        path: error.config?.url,
        method: error.config?.method,
        data: error.response?.data
      });
    }

    return Promise.reject(error);
  }
);
