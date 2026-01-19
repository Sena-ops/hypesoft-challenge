# Nexus - Sistema de Gestão de Produtos

Sistema de gestão de produtos em desenvolvimento com **.NET 9** e **Next.js 14**, seguindo os princípios de Clean Architecture, DDD e CQRS.

> **Nota**: Este projeto está em fase inicial de desenvolvimento. A estrutura base foi configurada e as funcionalidades estão sendo implementadas progressivamente.

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

### Frontend
- **Next.js 14** (App Router) com TypeScript
- **TailwindCSS** + **Shadcn/ui** para estilização
- **TanStack Query** para gerenciamento de estado
- **React Hook Form** + **Zod** para validação
- **Recharts** para dashboards
- **Vitest** + **React Testing Library** para testes

### Infraestrutura
- **MongoDB** como banco principal
- **Keycloak** para autenticação e autorização
- **Docker** + **Docker Compose** para containerização
- **Nginx** como reverse proxy

## 📋 Pré-requisitos

- Docker Desktop 4.0+
- Node.js 18+
- .NET 9 SDK
- Git

## 🛠️ Instalação e Execução

### Executando com Docker Compose

```bash
# Clone o repositório
git clone <repository-url>
cd nexus

# Copie as variáveis de ambiente
cp .env.example .env

# Execute toda a aplicação com Docker Compose
docker-compose up -d

# Aguarde alguns segundos para os serviços iniciarem
# Verifique se todos os containers estão rodando
docker-compose ps
```

### URLs de Acesso

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger
- **MongoDB Express**: http://localhost:8081
- **Keycloak**: http://localhost:8080
- **Nginx (Reverse Proxy)**: http://localhost

> **Nota**: Atualmente apenas o Health Check está disponível na API. Os demais endpoints serão implementados conforme o desenvolvimento progride.

### Desenvolvimento Local

#### Backend

```bash
cd backend

# Restaurar dependências
dotnet restore

# Executar a API
cd src/Nexus.API
dotnet run

# Ou executar todos os projetos
cd ../..
dotnet run --project src/Nexus.API/Nexus.API.csproj
```

#### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

### Executando Testes

> **Nota**: A estrutura de testes está configurada, mas os testes ainda serão implementados durante o desenvolvimento.

#### Backend

```bash
cd backend
dotnet test
```

#### Frontend

```bash
cd frontend
npm test
```

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
│   │   ├── Nexus.Infrastructure/  # Camada de Infraestrutura
│   │   │   ├── Data/
│   │   │   ├── Repositories/
│   │   │   └── Configurations/
│   │   └── Nexus.API/             # Camada de Apresentação
│   │       ├── Controllers/
│   │       ├── Middlewares/
│   │       └── Extensions/
│   └── Nexus.sln
├── frontend/
│   ├── src/
│   │   ├── app/                   # App Router (Next.js 14)
│   │   ├── components/            # Componentes reutilizáveis
│   │   │   ├── ui/                # Shadcn/ui components
│   │   │   ├── forms/
│   │   │   └── layout/
│   │   ├── hooks/                 # Custom hooks
│   │   ├── services/              # Serviços de API
│   │   ├── types/                 # Definições de tipos
│   │   └── lib/                   # Utilitários
│   ├── public/
│   └── package.json
├── nginx/
│   └── nginx.conf                 # Configuração do Nginx
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔐 Autenticação (Keycloak)

O sistema utiliza **Keycloak** para autenticação e autorização. 

### Configuração Inicial do Keycloak

1. Acesse http://localhost:8080
2. Faça login com:
   - Usuário: `admin`
   - Senha: `admin`
3. Crie um novo Realm chamado `nexus`
4. Crie um Client chamado `nexus-frontend`
5. Configure as URLs de redirecionamento
6. Crie roles conforme necessário (Admin, Manager, User)

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

### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, ponto e vírgula, etc
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de manutenção
- `perf`: Melhorias de performance
- `build`: Build e dependências

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** com separação clara de responsabilidades:

1. **Domain**: Entidades, Value Objects, Interfaces de Repositório e Lógica de Domínio
2. **Application**: Use Cases, DTOs, Validações e Mapeamentos (CQRS com MediatR)
3. **Infrastructure**: Implementação de Repositórios, Configurações de Banco de Dados e Serviços Externos
4. **API**: Controllers, Middlewares, Configurações de DI e Startup

## ✅ Status do Projeto

**Fase Atual**: Setup inicial concluído - Estrutura base criada

### O que já está implementado:
- ✅ Estrutura de Clean Architecture no backend (.NET 9)
- ✅ Estrutura base do frontend (Next.js 14)
- ✅ Configuração do Docker Compose com todos os serviços
- ✅ Entidades de domínio (Product, Category, Money)
- ✅ Repositórios base implementados (MongoDB)
- ✅ Configuração de Swagger/OpenAPI
- ✅ Health checks e logging estruturado (Serilog)
- ✅ Componentes base do UI (Shadcn/ui)
- ✅ Configuração de testes (xUnit + Vitest)

### 🚧 Em Desenvolvimento

- ⏳ Implementação de Commands e Queries (CQRS)
- ⏳ Handlers do MediatR
- ⏳ DTOs e Mappers
- ⏳ Validações com FluentValidation
- ⏳ Controllers da API
- ⏳ Integração com Keycloak
- ⏳ Interface do frontend
- ⏳ Testes automatizados

## 📄 Licença

Este projeto foi desenvolvido como parte de um desafio técnico.

## 👨‍💻 Autor

Desenvolvido seguindo as melhores práticas de desenvolvimento de software.
