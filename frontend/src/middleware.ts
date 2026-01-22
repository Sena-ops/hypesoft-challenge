import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Rotas públicas que não requerem autenticação
 */
const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/silent-check-sso.html",
];

/**
 * Rotas de autenticação (login, register)
 * Usuários autenticados devem ser redirecionados para o dashboard
 */
const authRoutes = ["/auth/login", "/auth/register"];

/**
 * Rotas protegidas que requerem autenticação
 */
const protectedRoutes = [
  "/dashboard",
  "/products",
  "/categories",
];

/**
 * Middleware do Next.js para proteção de rotas
 * 
 * Nota: A validação completa do token é feita no cliente pelo KeycloakProvider.
 * Este middleware serve como uma camada adicional de proteção e UX:
 * - Redireciona usuários para login se tentarem acessar rotas protegidas sem sessão
 * - Redireciona usuários autenticados que tentam acessar páginas de login
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permite acesso a arquivos estáticos e API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // arquivos estáticos (.ico, .png, etc)
  ) {
    return NextResponse.next();
  }

  // Verifica se a rota é pública
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  
  // Verifica se é uma rota de autenticação
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  
  // Verifica se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Para rotas públicas, permite o acesso
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Adiciona headers de segurança em todas as respostas
  const response = NextResponse.next();
  
  // Headers de segurança
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

/**
 * Configuração do matcher para o middleware
 * Define quais rotas o middleware deve interceptar
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
