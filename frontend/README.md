# Nexus Frontend

Interface web em desenvolvimento com Next.js 14 (App Router), TypeScript, TailwindCSS e Shadcn/ui.

> **Status**: Estrutura inicial configurada - Interface em desenvolvimento

## ✅ O que já está implementado:

- ✅ Next.js 14 configurado (App Router)
- ✅ TypeScript configurado
- ✅ TailwindCSS + Shadcn/ui configurados
- ✅ TanStack Query configurado
- ✅ Componentes base do UI (Button, Card)
- ✅ Estrutura de pastas organizada
- ✅ Serviços de API base configurados
- ✅ Tipos TypeScript definidos
- ✅ Vitest configurado para testes

## 🚧 Em Desenvolvimento:

- ⏳ Páginas da aplicação
- ⏳ Formulários de produtos e categorias
- ⏳ Dashboard com gráficos
- ⏳ Integração com Keycloak
- ⏳ Proteção de rotas
- ⏳ Componentes de layout
- ⏳ Testes automatizados

## 🚀 Executando o Projeto

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install
```

### Desenvolvimento

```bash
# Executar em modo de desenvolvimento
npm run dev
```

A aplicação estará disponível em http://localhost:3000

### Build de Produção

```bash
# Criar build de produção
npm run build

# Executar build de produção
npm start
```

### Docker

```bash
# Build da imagem
docker build -t nexus-frontend .

# Executar o container
docker run -p 3000:3000 nexus-frontend
```

## 🧪 Testes

> **Nota**: A estrutura de testes está configurada (Vitest + React Testing Library), mas os testes ainda serão implementados durante o desenvolvimento.

```bash
# Executar testes
npm test

# Executar testes com UI
npm run test:ui

# Executar testes com cobertura
npm run test:coverage
```

## 📁 Estrutura

```
src/
├── app/                   # App Router (Next.js 14)
│   ├── layout.tsx        # Layout raiz
│   ├── page.tsx          # Página inicial
│   └── globals.css       # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes Shadcn/ui
│   ├── forms/            # Componentes de formulário
│   └── layout/           # Componentes de layout
├── hooks/                 # Custom hooks
├── services/              # Serviços de API
├── types/                 # Definições TypeScript
└── lib/                   # Utilitários
```

## 🎨 Estilização

O projeto utiliza:
- **TailwindCSS**: Framework CSS utilitário
- **Shadcn/ui**: Componentes UI baseados em Radix UI
- **Lucide React**: Ícones

## 🔧 Configuração

Variáveis de ambiente devem ser configuradas no arquivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=nexus
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nexus-frontend
```
