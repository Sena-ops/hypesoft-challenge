# Nexus Backend

API REST desenvolvida com .NET 9 seguindo os princípios de Clean Architecture, DDD e CQRS.

> **Status**: ✅ Completo - Todas as funcionalidades implementadas e testadas.

## ✅ Funcionalidades Implementadas

### Seed de Dados
- ✅ População automática do banco de dados com dados de exemplo
- ✅ 8 categorias pré-cadastradas
- ✅ 40+ produtos distribuídos nas categorias
- ✅ Produtos com estoque baixo para demonstrar funcionalidades
- ✅ Seed executado automaticamente na primeira inicialização

### Gestão de Produtos
- ✅ CRUD completo de produtos
- ✅ Busca por nome com paginação
- ✅ Filtros por categoria, preço e estoque
- ✅ Validação com FluentValidation
- ✅ Controle de estoque
- ✅ Produtos com estoque baixo
- ✅ Exclusão em lote

### Sistema de Categorias
- ✅ CRUD completo de categorias
- ✅ Validação de produtos vinculados
- ✅ Busca de categorias

### Dashboard
- ✅ Estatísticas de produtos
- ✅ Valor total do estoque
- ✅ Contagem de categorias
- ✅ Lista de produtos com estoque baixo
- ✅ Distribuição por categoria

### Autenticação e Autorização
- ✅ Integração completa com Keycloak
- ✅ JWT token validation
- ✅ Autorização baseada em roles (Admin, Editor, Leitor)
- ✅ Gerenciamento de usuários via Keycloak Admin API
- ✅ Atualização de roles de usuários

### Infraestrutura
- ✅ Clean Architecture (4 camadas)
- ✅ CQRS com MediatR
- ✅ MongoDB com repositórios
- ✅ Redis para cache
- ✅ Logging estruturado (Serilog)
- ✅ Health checks
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Swagger/OpenAPI completo

## 🏗️ Arquitetura

O projeto está organizado em 4 camadas principais:

### Nexus.Domain
- **Entidades**: Product, Category, User
- **Value Objects**: Money
- **Interfaces**: IProductRepository, ICategoryRepository, IUserRepository
- **Lógica de Domínio**: Regras de negócio puras

### Nexus.Application
- **Commands**: CreateProductCommand, UpdateProductCommand, DeleteProductCommand
- **Queries**: GetAllProductsQuery, GetProductByIdQuery, SearchProductsQuery
- **Handlers**: Implementação dos handlers MediatR
- **DTOs**: ProductDto, CategoryDto, UserRoleDto
- **Validators**: FluentValidation validators
- **Mappings**: AutoMapper profiles

### Nexus.Infrastructure
- **Data**: MongoDbContext, configurações
- **Repositories**: Implementação dos repositórios MongoDB
- **Services**: KeycloakAdminService, CacheService
- **Configurations**: DI, MongoDB, Keycloak

### Nexus.API
- **Controllers**: ProductsController, CategoriesController, DashboardController, UsersController
- **Middlewares**: AuthenticationLoggingMiddleware, ErrorHandlingMiddleware
- **Extensions**: AuthenticationExtensions, ServiceCollectionExtensions
- **Filters**: Exception filters

## 🚀 Executando o Projeto

### Pré-requisitos

- .NET 9 SDK (para desenvolvimento local)
- Docker (para executar serviços)

### Com Docker Compose (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d
```

A API estará disponível em: http://localhost:5000/api

### Desenvolvimento Local

1. **Inicie os serviços necessários**:
   ```bash
   # Na raiz do projeto
   docker-compose up -d mongodb keycloak redis
   ```

2. **Execute a API**:
   ```bash
   cd src/Nexus.API
   dotnet restore
   dotnet run
   ```

   Ou da raiz do backend:
   ```bash
   dotnet run
   ```

### Docker

```bash
# Build da imagem
docker build -t nexus-api -f src/Nexus.API/Dockerfile .

# Executar o container
docker run -p 5000:80 \
  -e ConnectionStrings__MongoDB=mongodb://mongodb:27017 \
  -e Keycloak__Authority=http://keycloak:8080/realms/nexus \
  nexus-api
```

## 🧪 Testes

```bash
# Executar todos os testes
dotnet test

# Executar testes com cobertura
dotnet test /p:CollectCoverage=true

# Executar testes de um projeto específico
dotnet test src/Nexus.Application.Tests/Nexus.Application.Tests.csproj
```

## 📚 Swagger

Quando a aplicação estiver rodando, acesse:
- **Swagger UI**: http://localhost:5000/swagger

A documentação inclui:
- Todos os endpoints disponíveis
- Schemas de requisição e resposta
- Exemplos de uso
- Autenticação via Keycloak

## 🔧 Configuração

As configurações estão em `src/Nexus.API/appsettings.json` e `appsettings.Development.json`.

### Principais Configurações

```json
{
  "ConnectionStrings": {
    "MongoDB": "mongodb://mongodb:27017",
    "Redis": "redis:6379"
  },
  "MongoDB": {
    "DatabaseName": "nexus"
  },
  "Keycloak": {
    "Authority": "http://keycloak:8080/realms/nexus",
    "Audience": "nexus-api"
  },
  "Cors": {
    "AllowedOrigins": "http://localhost:3000"
  }
}
```

## 🔐 Autenticação

A API utiliza Keycloak para autenticação. Todos os endpoints (exceto `/health` e `/swagger`) requerem autenticação via JWT token.

### Roles e Permissões

- **admin**: Acesso total, incluindo gerenciamento de usuários
- **editor**: Pode criar, editar e excluir produtos e categorias
- **leitor**: Apenas visualização

### Endpoints de Autenticação

- `GET /api/users` - Lista usuários (requer role: admin)
- `GET /api/users/{userId}` - Busca usuário por ID (requer role: admin)
- `PUT /api/users/{userId}/roles` - Atualiza roles de usuário (requer role: admin)

## 📊 Endpoints Disponíveis

### Produtos
- `GET /api/products` - Lista produtos (paginado)
- `GET /api/products/{id}` - Busca produto por ID
- `POST /api/products` - Cria produto (requer role: editor/admin)
- `PUT /api/products/{id}` - Atualiza produto (requer role: editor/admin)
- `DELETE /api/products/{id}` - Exclui produto (requer role: editor/admin)
- `GET /api/products/search?name={name}` - Busca produtos por nome
- `GET /api/products/low-stock?threshold={threshold}` - Produtos com estoque baixo

### Categorias
- `GET /api/categories` - Lista categorias
- `GET /api/categories/{id}` - Busca categoria por ID
- `POST /api/categories` - Cria categoria (requer role: editor/admin)
- `PUT /api/categories/{id}` - Atualiza categoria (requer role: editor/admin)
- `DELETE /api/categories/{id}` - Exclui categoria (requer role: editor/admin)

### Dashboard
- `GET /api/dashboard` - Estatísticas do dashboard

### Usuários
- `GET /api/users` - Lista usuários (requer role: admin)
- `GET /api/users/{userId}` - Busca usuário (requer role: admin)
- `PUT /api/users/{userId}/roles` - Atualiza roles (requer role: admin)

### Health
- `GET /api/health` - Health check (público)

## 🏛️ Padrões Implementados

- ✅ **Clean Architecture**: Separação clara de camadas
- ✅ **DDD**: Entidades e Value Objects
- ✅ **CQRS**: Separação de Commands e Queries
- ✅ **MediatR**: Padrão Mediator
- ✅ **Repository Pattern**: Abstração de acesso a dados
- ✅ **Dependency Injection**: Inversão de controle
- ✅ **FluentValidation**: Validação declarativa
- ✅ **AutoMapper**: Mapeamento de objetos

## 📝 Logging

O projeto utiliza Serilog para logging estruturado:
- Logs em console (desenvolvimento)
- CorrelationId para rastreamento
- Logs de autenticação e autorização
- Tratamento de erros com contexto

## 🔒 Segurança

- ✅ JWT token validation
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Headers de segurança
- ✅ Validação de entrada
- ✅ Sanitização de dados
- ✅ Autorização baseada em roles

## 📄 Licença

Este projeto foi desenvolvido como parte de um desafio técnico.
