# Nexus Backend

API REST em desenvolvimento com .NET 9 seguindo os princípios de Clean Architecture, DDD e CQRS.

> **Status**: Fase 4 Concluída - Autenticação e Dashboard implementados.

## ✅ O que já está implementado:

- ✅ Estrutura de Clean Architecture (4 camadas)
- ✅ Entidades de domínio (Product, Category, User)
- ✅ Autenticação JWT completa (Login, Registro)
- ✅ Dashboard com estatísticas (Produtos, Estoque, Vendas)
- ✅ Implementação dos repositórios MongoDB
- ✅ Configuração do DbContext
- ✅ Swagger/OpenAPI configurado
- ✅ Health checks
- ✅ Logging estruturado (Serilog)
- ✅ Rate limiting
- ✅ CORS configurado

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

1. **Inicie o MongoDB** (se não tiver um rodando localmente):
   ```bash
   # Na raiz do projeto
   docker-compose up -d mongodb
   ```

2. **Execute a API**:
   ```bash
   cd src/Nexus.API
   dotnet restore
   dotnet run
   ```

   Ou da raiz do backend:
   ```bash
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

```bash
# Executar todos os testes
dotnet test

# Executar testes com cobertura
dotnet test /p:CollectCoverage=true
```

## 📚 Swagger

Quando a aplicação estiver rodando, acesse:
- Swagger UI: http://localhost:5000/swagger

## 🔧 Configuração

As configurações estão em `src/Nexus.API/appsettings.json` e `appsettings.Development.json`.

Principais configurações:
- **ConnectionStrings:MongoDB**: String de conexão com o MongoDB
- **Jwt**: Configurações de Token (Key, Issuer, Audience)
