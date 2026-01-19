# Nexus Backend

API REST em desenvolvimento com .NET 9 seguindo os princípios de Clean Architecture, DDD e CQRS.

> **Status**: Estrutura inicial configurada - Funcionalidades em desenvolvimento

## ✅ O que já está implementado:

- ✅ Estrutura de Clean Architecture (4 camadas)
- ✅ Entidades de domínio (Product, Category)
- ✅ Value Objects (Money)
- ✅ Interfaces de repositórios
- ✅ Implementação dos repositórios MongoDB
- ✅ Configuração do DbContext
- ✅ Swagger/OpenAPI configurado
- ✅ Health checks
- ✅ Logging estruturado (Serilog)
- ✅ Rate limiting
- ✅ CORS configurado

## 🚧 Em Desenvolvimento:

- ⏳ Commands e Queries (CQRS)
- ⏳ Handlers do MediatR
- ⏳ DTOs e AutoMapper
- ⏳ Validações com FluentValidation
- ⏳ Controllers da API
- ⏳ Integração com Keycloak
- ⏳ Testes automatizados

## 🏗️ Arquitetura

O projeto está organizado em 4 camadas principais:

- **Nexus.Domain**: Entidades, Value Objects, Interfaces de Repositório e Lógica de Domínio
- **Nexus.Application**: Use Cases, DTOs, Validações e Mapeamentos (CQRS com MediatR)
- **Nexus.Infrastructure**: Implementação de Repositórios, Configurações de Banco de Dados e Serviços Externos
- **Nexus.API**: Controllers, Middlewares, Configurações de DI e Startup

## 🚀 Executando o Projeto

### Pré-requisitos

- .NET 9 SDK
- MongoDB (rodando localmente ou via Docker)

### Desenvolvimento Local

```bash
# Restaurar dependências
dotnet restore

# Executar a API
cd src/Nexus.API
dotnet run

# Ou executar de qualquer lugar
dotnet run --project src/Nexus.API/Nexus.API.csproj
```

### Docker

```bash
# Build da imagem
docker build -t nexus-api -f src/Nexus.API/Dockerfile .

# Executar o container
docker run -p 5000:80 nexus-api
```

## 🧪 Testes

> **Nota**: A estrutura de testes está configurada, mas os testes ainda serão implementados durante o desenvolvimento.

```bash
# Executar todos os testes
dotnet test

# Executar testes com cobertura
dotnet test /p:CollectCoverage=true
```

## 📚 Swagger

Quando a aplicação estiver rodando, acesse:
- Swagger UI: http://localhost:5000/swagger

> **Nota**: Atualmente apenas o Health Check está disponível. Os demais endpoints serão implementados conforme o desenvolvimento progride.

## 🔧 Configuração

As configurações estão em `src/Nexus.API/appsettings.json` e `appsettings.Development.json`.

Principais configurações:
- **ConnectionStrings:MongoDB**: String de conexão com o MongoDB
- **MongoDB:DatabaseName**: Nome do banco de dados
- **Cors:AllowedOrigins**: Origens permitidas para CORS
- **Keycloak**: Configurações de autenticação
