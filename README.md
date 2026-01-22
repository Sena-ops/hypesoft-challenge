# Nexus - Sistema de Gestão de Produtos

Sistema completo de gestão de produtos desenvolvido com **.NET 9** e **Next.js 14**, seguindo os princípios de Clean Architecture, DDD e CQRS.

> **Status**: ✅ Projeto Completo - Todas as funcionalidades implementadas e testadas.

## 🚀 Tecnologias

### Backend
- **.NET 9** com C#
- **Clean Architecture** + **DDD** (Domain-Driven Design)
- **CQRS** + **MediatR** pattern
- **MongoDB** com MongoDB Driver
- **FluentValidation** para validação
- **AutoMapper** para mapeamento
- **Serilog** para logging estruturado
- **Swagger/OpenAPI** para documentação
- **Keycloak** para autenticação e autorização

### Frontend
- **Next.js 14** (App Router) com TypeScript
- **TailwindCSS** + **Shadcn/ui** para estilização
- **TanStack Query (React Query)** para gerenciamento de estado
- **React Hook Form** + **Zod** para validação
- **Recharts** para dashboards
- **Vitest** + **React Testing Library** para testes

### Infraestrutura
- **MongoDB** como banco principal
- **Keycloak** para autenticação e autorização
- **Redis** para cache
- **PostgreSQL** para Keycloak
- **Docker** + **Docker Compose** para containerização
- **Nginx** como reverse proxy

## 📋 Pré-requisitos

- Docker Desktop 4.0+
- Git

> **Nota**: Não é necessário ter Node.js ou .NET SDK instalados localmente, pois tudo roda via Docker.

## 🛠️ Instalação e Execução

### Executando com Docker Compose (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/hypesoft-challenge.git
cd hypesoft-challenge

# (Opcional) Para produção ou customização, copie e ajuste as variáveis de ambiente
# cp .env.example .env
# Edite o arquivo .env com seus valores personalizados

# Execute toda a aplicação com Docker Compose
# O docker-compose.yml já possui valores padrão, então funciona sem .env
docker-compose up -d

# Aguarde alguns segundos para os serviços iniciarem
# Verifique se todos os containers estão rodando
docker-compose ps

# O banco de dados será populado automaticamente com dados de exemplo na primeira execução
```

### URLs de Acesso

Após iniciar os containers, acesse:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000/api
- **Swagger**: http://localhost:5000/swagger
- **MongoDB Express**: http://localhost:8081
- **Keycloak**: http://localhost:8080
- **Nginx (Reverse Proxy)**: http://localhost

### Credenciais Padrão

#### Keycloak Admin Console
- **URL**: http://localhost:8080
- **Usuário**: `admin`
- **Senha**: `admin`

#### MongoDB Express
- **URL**: http://localhost:8081
- **Usuário**: `admin`
- **Senha**: `admin`

#### Usuários de Teste (Keycloak)
O sistema vem pré-configurado com usuários de teste:
- **Admin**: `admin@nexus.com` / `admin123`
- **Editor**: `editor@nexus.com` / `editor123`
- **Leitor**: `leitor@nexus.com` / `leitor123`

#### Dados de Exemplo
O banco de dados é populado automaticamente com:
- **8 categorias** de exemplo (Eletrônicos, Roupas, Casa e Jardim, Esportes, Livros, Alimentos, Beleza, Brinquedos)
- **40+ produtos** de exemplo distribuídos nas categorias
- Alguns produtos com **estoque baixo** (< 10 unidades) para demonstrar a funcionalidade do dashboard

## ✅ Funcionalidades Implementadas

### Gestão de Produtos
- ✅ Criar, listar, editar e excluir produtos
- ✅ Busca por nome do produto
- ✅ Filtros por categoria, preço e estoque
- ✅ Paginação eficiente
- ✅ Validação completa de dados
- ✅ Controle de estoque
- ✅ Exclusão em lote

### Sistema de Categorias
- ✅ Criar, listar, editar e excluir categorias
- ✅ Busca de categorias
- ✅ Validação de produtos vinculados antes de excluir
- ✅ Associação de produtos a categorias

### Dashboard
- ✅ Total de produtos cadastrados
- ✅ Valor total do estoque
- ✅ Total de categorias
- ✅ Lista de produtos com estoque baixo (< 10 unidades)
- ✅ Gráfico de distribuição de produtos por categoria
- ✅ Atualização automática de dados

### Sistema de Autenticação e Autorização
- ✅ Integração completa com Keycloak
- ✅ Login via OAuth2/OpenID Connect
- ✅ Proteção de rotas no frontend
- ✅ Autorização baseada em roles (Admin, Editor, Leitor)
- ✅ Logout integrado
- ✅ Refresh automático de tokens
- ✅ Gerenciamento de usuários e roles (Admin)

### Performance e Otimização
- ✅ Cache com React Query
- ✅ Paginação no backend e frontend
- ✅ Queries otimizadas no MongoDB
- ✅ Lazy loading de componentes
- ✅ Code splitting automático (Next.js)

### Segurança
- ✅ Validação em múltiplas camadas
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Headers de segurança
- ✅ Sanitização de entradas
- ✅ JWT tokens validados
- ✅ Variáveis de ambiente configuráveis via `.env` (não commitado)
- ✅ Valores padrão seguros para desenvolvimento

## 📁 Estrutura do Projeto

```
nexus/
├── backend/
│   ├── src/
│   │   ├── Nexus.Domain/          # Camada de Domínio
│   │   │   ├── Entities/
│   │   │   ├── ValueObjects/
│   │   │   └── Repositories/
│   │   ├── Nexus.Application/     # Camada de Aplicação
│   │   │   ├── Commands/
│   │   │   ├── Queries/
│   │   │   ├── Handlers/
│   │   │   ├── DTOs/
│   │   │   └── Validators/
│   │   ├── Nexus.Infrastructure/ # Camada de Infraestrutura
│   │   │   ├── Data/
│   │   │   ├── Repositories/
│   │   │   ├── Services/
│   │   │   └── Configurations/
│   │   └── Nexus.API/             # Camada de Apresentação
│   │       ├── Controllers/
│   │       ├── Middlewares/
│   │       └── Extensions/
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── app/                   # App Router (Next.js 14)
│   │   │   ├── auth/              # Páginas de autenticação
│   │   │   ├── dashboard/        # Dashboard
│   │   │   ├── products/         # Gestão de produtos
│   │   │   ├── categories/       # Gestão de categorias
│   │   │   └── settings/         # Configurações
│   │   ├── components/            # Componentes reutilizáveis
│   │   │   ├── ui/               # Shadcn/ui components
│   │   │   ├── charts/            # Componentes de gráficos
│   │   │   └── layout/           # Componentes de layout
│   │   ├── hooks/                 # Custom hooks (React Query)
│   │   ├── services/              # Serviços de API
│   │   ├── types/                 # Definições TypeScript
│   │   └── lib/                   # Utilitários e validações
│   └── README.md
├── keycloak/
│   └── nexus-realm.json           # Configuração do realm Keycloak
├── nginx/
│   └── nginx.conf                 # Configuração do Nginx
├── docker-compose.yml
├── .env.example          # Template de variáveis de ambiente (pode ser commitado)
├── .env                  # Arquivo local de variáveis (NÃO commitado - opcional)
└── README.md
```

## 🔐 Autenticação (Keycloak)

O sistema utiliza **Keycloak** para autenticação e autorização. O realm `nexus` é importado automaticamente ao iniciar o container.

### Roles Disponíveis

- **admin**: Acesso total ao sistema, incluindo gerenciamento de usuários
- **editor**: Pode criar, editar e excluir produtos e categorias
- **leitor**: Apenas visualização de dados

### Configuração Automática

O Keycloak é configurado automaticamente via `keycloak/nexus-realm.json` com:
- Realm `nexus` pré-configurado
- Client `nexus-frontend` configurado
- Usuários de teste pré-criados
- Roles configuradas

## 🧪 Testes

### Backend

```bash
cd backend
cd src
cd Nexus.API
dotnet test
```

### Frontend

```bash
cd frontend
npm test
```

## 📝 Padrões de Commit

Este projeto utiliza [Conventional Commits](https://conventionalcommits.org/):

```bash
feat(products): add bulk import functionality
fix(api): resolve pagination issue in products endpoint
docs(readme): update installation instructions
test(products): add unit tests for product service
refactor(auth): improve JWT token validation
perf(database): optimize product search queries
style(frontend): apply consistent spacing in components
chore(deps): update dependencies to latest versions
```

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** com separação clara de responsabilidades:

1. **Domain**: Entidades, Value Objects, Interfaces de Repositório e Lógica de Domínio
2. **Application**: Use Cases, DTOs, Validações e Mapeamentos (CQRS com MediatR)
3. **Infrastructure**: Implementação de Repositórios, Configurações de Banco de Dados e Serviços Externos
4. **API**: Controllers, Middlewares, Configurações de DI e Startup

### Frontend - Arquitetura Modular

- **App Router**: Next.js 14 com roteamento baseado em arquivos
- **React Query**: Gerenciamento de estado servidor e cache
- **Componentes**: Arquitetura modular e reutilizável
- **Hooks Customizados**: Lógica de negócio reutilizável

## 🐳 Docker

### Serviços Incluídos

- **mongodb**: Banco de dados principal
- **mongo-express**: Interface web para MongoDB
- **keycloak**: Servidor de autenticação
- **keycloak-db**: Banco PostgreSQL para Keycloak
- **redis**: Cache e sessões
- **api**: Backend .NET 9
- **frontend**: Frontend Next.js 14
- **nginx**: Reverse proxy

### Comandos Úteis

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Rebuild após mudanças
docker-compose up -d --build

# Parar e remover volumes
docker-compose down -v
```

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger:

- **Swagger UI**: http://localhost:5000/swagger

A API inclui:
- Documentação de todos os endpoints
- Schemas de requisição e resposta
- Exemplos de uso
- Autenticação via Keycloak

## 🎯 Entregáveis

### ✅ Código Fonte
- ✅ Repositório GitHub com código completo
- ✅ README detalhado
- ✅ Docker Compose funcional
- ✅ Estrutura de testes configurada

### ✅ Aplicação Funcionando
- ✅ Todos os serviços rodando via Docker Compose
- ✅ Interface funcional e responsiva
- ✅ Autenticação e autorização funcionando
- ✅ Todas as funcionalidades implementadas

### ✅ Documentação
- ✅ API documentada com Swagger
- ✅ Guia de instalação e execução completo
- ✅ READMEs atualizados para cada módulo
- ✅ Comentários no código

## 🚀 Desenvolvimento Local

### Backend

```bash
cd backend

# Restaurar dependências
dotnet restore

# Executar a API
cd src/Nexus.API
dotnet run
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

> **Nota**: Para desenvolvimento local, certifique-se de que os serviços (MongoDB, Keycloak, Redis) estejam rodando via Docker Compose.

## 📄 Licença

Este projeto foi desenvolvido como parte de um desafio técnico.


