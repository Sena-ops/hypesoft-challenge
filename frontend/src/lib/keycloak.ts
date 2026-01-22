import Keycloak from "keycloak-js";

/**
 * Configuração do cliente Keycloak
 * As variáveis de ambiente são definidas no .env.local ou docker-compose
 */
const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "nexus",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "nexus-frontend",
};

/**
 * Instância singleton do Keycloak
 * Inicializada apenas no cliente (browser)
 */
let keycloakInstance: Keycloak | null = null;

/**
 * Retorna a instância do Keycloak (cria se não existir)
 * Deve ser chamada apenas no cliente
 */
export const getKeycloakInstance = (): Keycloak => {
  if (typeof window === "undefined") {
    throw new Error("Keycloak só pode ser inicializado no cliente");
  }

  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }

  return keycloakInstance;
};

/**
 * Opções de inicialização do Keycloak
 */
export const keycloakInitOptions: Keycloak.KeycloakInitOptions = {
  onLoad: "check-sso",
  silentCheckSsoRedirectUri:
    typeof window !== "undefined"
      ? `${window.location.origin}/silent-check-sso.html`
      : undefined,
  pkceMethod: "S256",
  checkLoginIframe: false,
};

/**
 * Interface para informações do usuário extraídas do token
 */
export interface KeycloakUser {
  id: string;
  name: string;
  email: string;
  username: string;
  roles: string[];
}

/**
 * Extrai informações do usuário do token do Keycloak
 */
export const parseKeycloakUser = (keycloak: Keycloak): KeycloakUser | null => {
  if (!keycloak.tokenParsed) {
    return null;
  }

  const tokenParsed = keycloak.tokenParsed as {
    sub?: string;
    name?: string;
    email?: string;
    preferred_username?: string;
    realm_access?: { roles?: string[] };
    resource_access?: Record<string, { roles?: string[] }>;
  };

  // Extrai roles do realm e do client
  const realmRoles = tokenParsed.realm_access?.roles || [];
  const clientRoles =
    tokenParsed.resource_access?.[keycloakConfig.clientId]?.roles || [];
  const allRoles = Array.from(new Set([...realmRoles, ...clientRoles]));

  return {
    id: tokenParsed.sub || "",
    name: tokenParsed.name || tokenParsed.preferred_username || "",
    email: tokenParsed.email || "",
    username: tokenParsed.preferred_username || "",
    roles: allRoles,
  };
};

/**
 * Verifica se o usuário tem uma determinada role
 */
export const hasRole = (keycloak: Keycloak, role: string): boolean => {
  const user = parseKeycloakUser(keycloak);
  if (!user) return false;
  
  return user.roles.some(
    (r) => r.toLowerCase() === role.toLowerCase()
  );
};

/**
 * Verifica se o usuário tem qualquer uma das roles especificadas
 */
export const hasAnyRole = (keycloak: Keycloak, roles: string[]): boolean => {
  return roles.some((role) => hasRole(keycloak, role));
};

export default keycloakConfig;
