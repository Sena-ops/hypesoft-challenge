# Nexus Frontend

Interface web desenvolvida com Next.js 14 (App Router), TypeScript, TailwindCSS e Shadcn/ui.

> **Status**: ✅ Completo - Todas as funcionalidades implementadas e testadas.

## ✅ Funcionalidades Implementadas

### Dados de Exemplo
- ✅ Banco de dados populado automaticamente com dados de exemplo
- ✅ 8 categorias e 40+ produtos disponíveis na primeira execução
- ✅ Produtos com estoque baixo para testar funcionalidades do dashboard

### Gestão de Produtos
- ✅ Listagem de produtos com paginação
- ✅ Criação de novos produtos
- ✅ Edição de produtos existentes
- ✅ Exclusão de produtos (individual e em lote)
- ✅ Busca por nome
- ✅ Filtros por categoria, preço e estoque
- ✅ Validação em tempo real com React Hook Form + Zod
- ✅ Feedback visual para ações

### Sistema de Categorias
- ✅ Listagem de categorias
- ✅ Criação de novas categorias
- ✅ Edição de categorias existentes
- ✅ Exclusão de categorias
- ✅ Busca de categorias
- ✅ Validação de produtos vinculados

### Dashboard
- ✅ Estatísticas em tempo real
- ✅ Total de produtos cadastrados
- ✅ Valor total do estoque
- ✅ Total de categorias
- ✅ Lista de produtos com estoque baixo
- ✅ Gráfico de distribuição por categoria (Recharts)
- ✅ Atualização automática de dados

### Autenticação e Autorização
- ✅ Integração completa com Keycloak
- ✅ Login via OAuth2/OpenID Connect
- ✅ Proteção de rotas
- ✅ Autorização baseada em roles
- ✅ Logout integrado
- ✅ Refresh automático de tokens
- ✅ Gerenciamento de usuários e roles (Admin)

### Performance e UX
- ✅ Cache com React Query
- ✅ Loading states
- ✅ Error boundaries
- ✅ Toast notifications
- ✅ Interface responsiva
- ✅ Dark mode
- ✅ Validação em tempo real

## 🚀 Executando o Projeto

### Pré-requisitos

- Node.js 18+ (para desenvolvimento local)
- Docker (para executar via Docker Compose)

### Com Docker Compose (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d
```

O frontend estará disponível em: http://localhost:3000

### Desenvolvimento Local

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente**:
   Crie um arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
   NEXT_PUBLIC_KEYCLOAK_REALM=nexus
   NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nexus-frontend
   ```

3. **Execute em modo desenvolvimento**:
   ```bash
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
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:5000/api \
  -e NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080 \
  -e NEXT_PUBLIC_KEYCLOAK_REALM=nexus \
  -e NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nexus-frontend \
  nexus-frontend
```

## 🧪 Testes

> **Nota**: A estrutura de testes está configurada (Vitest + React Testing Library).

```bash
# Executar testes
npm test

# Executar testes com UI
npm run test:ui

# Executar testes com cobertura
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

## 📁 Estrutura

```
src/
├── app/                   # App Router (Next.js 14)
│   ├── auth/              # Páginas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Dashboard principal
│   ├── products/          # Gestão de produtos
│   │   ├── new/          # Criar produto
│   │   └── [id]/edit/    # Editar produto
│   ├── categories/        # Gestão de categorias
│   │   ├── new/          # Criar categoria
│   │   └── [id]/edit/    # Editar categoria
│   ├── settings/          # Configurações (Admin)
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Página inicial
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes Shadcn/ui
│   ├── charts/            # Componentes de gráficos
│   ├── dashboard/         # Componentes do dashboard
│   ├── layout/            # Componentes de layout
│   └── auth/              # Componentes de autenticação
├── hooks/                 # Custom hooks
│   ├── useProducts.ts     # Hooks para produtos (React Query)
│   ├── useCategories.ts   # Hooks para categorias (React Query)
│   ├── useDashboard.ts    # Hooks para dashboard (React Query)
│   ├── useUsers.ts        # Hooks para usuários (React Query)
│   └── useRequireAuth.ts  # Hook de autenticação
├── services/              # Serviços de API
│   └── api.ts             # Cliente Axios configurado
├── stores/               # Context stores
│   └── KeycloakContext.tsx # Context do Keycloak
├── types/                 # Definições TypeScript
│   └── index.ts           # Tipos compartilhados
└── lib/                   # Utilitários
    ├── keycloak.ts        # Configuração do Keycloak
    ├── utils.ts           # Funções utilitárias
    └── validations/       # Schemas Zod
        ├── product.ts
        └── category.ts
```

## 🎨 Estilização

O projeto utiliza:
- **TailwindCSS**: Framework CSS utilitário
- **Shadcn/ui**: Componentes UI baseados em Radix UI
- **Lucide React**: Ícones
- **Recharts**: Gráficos e visualizações

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=nexus
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nexus-frontend
```

### Next.js Config

O projeto está configurado com:
- **Standalone output**: Para otimização de build Docker
- **TypeScript**: Strict mode habilitado
- **ESLint**: Configurado com regras do Next.js

## 🔐 Autenticação

O frontend utiliza Keycloak para autenticação via OAuth2/OpenID Connect.

### Fluxo de Autenticação

1. Usuário acessa página protegida
2. Redirecionamento para Keycloak se não autenticado
3. Login no Keycloak
4. Callback com token JWT
5. Token armazenado e usado em requisições API
6. Refresh automático de token

### Proteção de Rotas

- Rotas protegidas via `DashboardLayout`
- Verificação de roles via `useRequireAuth`
- Componentes condicionais: `ManagerOnly`, `AdminOnly`

## 📦 Tecnologias Utilizadas

### Core
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **React 18**: Biblioteca UI

### Estado e Dados
- **TanStack Query (React Query)**: Gerenciamento de estado servidor
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas

### UI
- **TailwindCSS**: Estilização utilitária
- **Shadcn/ui**: Componentes UI
- **Recharts**: Gráficos
- **Lucide React**: Ícones

### Testes
- **Vitest**: Runner de testes
- **React Testing Library**: Testes de componentes

## 🎯 Features Principais

### React Query Integration
- Cache automático de dados
- Invalidação inteligente
- Loading states automáticos
- Error handling centralizado
- Refetch automático

### Validação
- Validação em tempo real
- Schemas Zod para type-safety
- Mensagens de erro claras
- Validação no frontend e backend

### Performance
- Code splitting automático
- Lazy loading de componentes
- Cache otimizado
- Paginação eficiente

## 📄 Licença

Este projeto foi desenvolvido como parte de um desafio técnico.
