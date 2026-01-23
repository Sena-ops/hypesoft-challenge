# Decisões Arquiteturais - Nexus

Este documento descreve as principais decisões arquiteturais tomadas durante o desenvolvimento do sistema Nexus, incluindo justificativas e alternativas consideradas.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura Backend](#arquitetura-backend)
- [Arquitetura Frontend](#arquitetura-frontend)
- [Infraestrutura](#infraestrutura)
- [Segurança](#segurança)
- [Performance](#performance)
- [Observabilidade](#observabilidade)

---

## Visão Geral

O sistema Nexus foi desenvolvido seguindo os princípios de **Clean Architecture**, **Domain-Driven Design (DDD)** e **CQRS (Command Query Responsibility Segregation)**, garantindo escalabilidade, manutenibilidade e testabilidade.

### Princípios Fundamentais

1. **Separação de Responsabilidades**: Cada camada tem responsabilidades bem definidas
2. **Independência de Frameworks**: O domínio não depende de tecnologias específicas
3. **Testabilidade**: Código facilmente testável através de interfaces
4. **Escalabilidade**: Arquitetura preparada para crescimento horizontal

---

## Arquitetura Backend

### Clean Architecture com 4 Camadas

#### 1. Domain (Nexus.Domain)

**Decisão**: Camada mais interna, contendo apenas lógica de negócio pura.

**Justificativa**:
- Independência total de frameworks e tecnologias
- Facilita testes unitários sem dependências externas
- Regras de negócio centralizadas e reutilizáveis

**Componentes**:
- **Entities**: `Product`, `Category`, `User` com métodos de domínio
- **Value Objects**: `Money` para encapsular regras de preço
- **Interfaces de Repositório**: Contratos sem implementação

**Exemplo de Entidade**:
```csharp
// Product.cs - Métodos de domínio encapsulam regras de negócio
public void DecreaseStock(int quantity)
{
    if (quantity < 0)
        throw new ArgumentException("Quantity cannot be negative");
    
    if (StockQuantity < quantity)
        throw new InvalidOperationException("Insufficient stock");
    
    StockQuantity -= quantity;
    MarkAsUpdated();
}
```

**Benefícios**:
- Regras de negócio testáveis isoladamente
- Mudanças em frameworks não afetam o domínio
- Código auto-documentado através de métodos expressivos

---

#### 2. Application (Nexus.Application)

**Decisão**: Camada de casos de uso implementando CQRS com MediatR.

**Justificativa**:
- Separação clara entre comandos (escrita) e queries (leitura)
- Facilita adição de cross-cutting concerns (cache, logging, validação)
- Handlers focados em uma única responsabilidade

**Componentes**:
- **Commands**: `CreateProductCommand`, `UpdateProductCommand`, `DeleteProductCommand`
- **Queries**: `GetAllProductsQuery`, `GetProductByIdQuery`, `SearchProductsByNameQuery`
- **Handlers**: Implementação dos casos de uso
- **DTOs**: Objetos de transferência de dados
- **Validators**: FluentValidation para validação de entrada
- **Behaviors**: Pipeline behaviors (ex: CachingBehavior)

**Exemplo de CQRS**:
```csharp
// Command - Operação de escrita
public class CreateProductCommand : IRequest<ProductDto>
{
    public CreateProductDto Product { get; set; }
}

// Query - Operação de leitura
public class GetAllProductsQuery : IRequest<PagedResultDto<ProductDto>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
```

**Benefícios**:
- Escalabilidade independente de leitura e escrita
- Otimizações específicas para cada tipo de operação
- Facilita implementação de cache apenas em queries

---

#### 3. Infrastructure (Nexus.Infrastructure)

**Decisão**: Implementação de detalhes técnicos e integrações externas.

**Justificativa**:
- Isolamento de dependências externas (MongoDB, Redis, Keycloak)
- Facilita troca de tecnologias sem afetar outras camadas
- Implementações podem ser mockadas para testes

**Componentes**:
- **Repositories**: Implementação MongoDB dos repositórios
- **Data**: MongoDbContext, MongoDbIndexInitializer, DatabaseSeeder
- **Services**: KeycloakAdminService, RedisCacheService
- **Configurations**: Dependency Injection, configurações de serviços

**Exemplo de Repositório**:
```csharp
// ProductRepository.cs - Paginação eficiente no banco
public async Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(
    int page, int pageSize, string? categoryId, CancellationToken cancellationToken)
{
    // Executa contagem e busca em paralelo
    var countTask = _collection.CountDocumentsAsync(filter, cancellationToken);
    var itemsTask = _collection.Find(filter)
        .SortByDescending(p => p.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Limit(pageSize)
        .ToListAsync(cancellationToken);
    
    await Task.WhenAll(countTask, itemsTask);
    return (itemsTask.Result, (int)countTask.Result);
}
```

**Benefícios**:
- Otimizações específicas do MongoDB (índices, agregações)
- Cache distribuído com Redis
- Integração com Keycloak isolada

---

#### 4. API (Nexus.API)

**Decisão**: Camada de apresentação com controllers, middlewares e configurações.

**Justificativa**:
- Ponto de entrada único para a aplicação
- Middlewares para cross-cutting concerns (segurança, performance, logging)
- Configuração centralizada de autenticação e autorização

**Componentes**:
- **Controllers**: Endpoints RESTful usando MediatR
- **Middlewares**: SecurityHeadersMiddleware, PerformanceMonitoringMiddleware, AuthenticationLoggingMiddleware
- **Extensions**: Configuração de autenticação, Swagger, CORS

**Exemplo de Controller**:
```csharp
[Authorize]
public class ProductsController : BaseController
{
    private readonly IMediator _mediator;
    
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var query = new GetAllProductsQuery { Page = page, PageSize = pageSize };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
```

**Benefícios**:
- Controllers leves, apenas orquestram chamadas
- Lógica de negócio isolada nos handlers
- Fácil adicionar novos endpoints

---

### Domain-Driven Design (DDD)

#### Value Objects

**Decisão**: Uso de Value Objects para encapsular conceitos de domínio.

**Exemplo**: `Money` (Amount + Currency)

**Justificativa**:
- Encapsula regras de negócio (ex: não pode ser negativo)
- Garante consistência (sempre tem Amount e Currency juntos)
- Facilita validação e testes

**Implementação**:
```csharp
public class Money
{
    public decimal Amount { get; private set; }
    public string Currency { get; private set; }
    
    public Money(decimal amount, string currency = "BRL")
    {
        if (amount < 0)
            throw new ArgumentException("Amount cannot be negative");
        // ...
    }
}
```

**Benefícios**:
- Previne estados inválidos
- Código mais expressivo (`new Money(100, "BRL")` vs `{ Amount: 100, Currency: "BRL" }`)
- Facilita evolução (ex: adicionar conversão de moedas)

---

#### Entidades com Métodos de Domínio

**Decisão**: Entidades expõem métodos ao invés de propriedades públicas setters.

**Justificativa**:
- Encapsula regras de negócio dentro da entidade
- Previne estados inválidos
- Facilita rastreamento de mudanças (UpdatedAt)

**Exemplo**:
```csharp
public class Product : BaseEntity
{
    public void DecreaseStock(int quantity)
    {
        if (quantity < 0)
            throw new ArgumentException("Quantity cannot be negative");
        
        if (StockQuantity < quantity)
            throw new InvalidOperationException("Insufficient stock");
        
        StockQuantity -= quantity;
        MarkAsUpdated(); // Atualiza UpdatedAt automaticamente
    }
}
```

**Benefícios**:
- Regras de negócio centralizadas
- Impossível criar estados inválidos
- Facilita auditoria (UpdatedAt, UpdatedBy)

---

### CQRS com MediatR

**Decisão**: Separação de comandos (escrita) e queries (leitura) usando MediatR.

**Justificativa**:
- Escalabilidade independente
- Otimizações específicas (cache apenas em queries)
- Facilita adição de behaviors (logging, cache, validação)

**Pipeline Behaviors**:
- **CachingBehavior**: Cache automático para queries que implementam `ICacheableQuery`
- **Validação**: FluentValidation executado automaticamente antes dos handlers

**Exemplo de Behavior**:
```csharp
public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : ICacheableQuery<TResponse>
{
    // Cache automático: verifica cache antes, salva após execução
}
```

**Benefícios**:
- Cache transparente para queries
- Fácil adicionar novos behaviors (auditoria, rate limiting por comando)
- Handlers focados apenas na lógica de negócio

---

## Arquitetura Frontend

### Next.js 14 App Router

**Decisão**: Uso do App Router do Next.js 14 ao invés de Pages Router.

**Justificativa**:
- Server Components por padrão (melhor performance)
- Code splitting automático por rota
- Layouts aninhados e loading states nativos
- Melhor SEO e performance

**Estrutura**:
```
app/
├── auth/
│   ├── login/page.tsx
│   └── register/page.tsx
├── dashboard/page.tsx
├── products/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/edit/page.tsx
└── layout.tsx
```

**Benefícios**:
- Performance otimizada automaticamente
- Roteamento baseado em arquivos (intuitivo)
- Loading e error states nativos

---

### React Query (TanStack Query)

**Decisão**: Uso do React Query para gerenciamento de estado servidor.

**Justificativa**:
- Cache automático de dados do servidor
- Sincronização automática
- Gerenciamento de loading e error states
- Invalidação inteligente de cache

**Implementação**:
```typescript
export function useProducts(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: productKeys.list(params || {}),
    queryFn: async () => {
      const response = await api.get<PagedResult<Product>>(`/products?...`);
      return response.data;
    },
    staleTime: 30 * 1000, // Cache por 30 segundos
  });
}
```

**Benefícios**:
- Reduz requisições desnecessárias
- Atualização automática quando dados mudam
- Loading states consistentes

---

### Hooks Customizados

**Decisão**: Lógica de negócio encapsulada em hooks customizados.

**Justificativa**:
- Reutilização de lógica entre componentes
- Separação de concerns (UI vs lógica)
- Facilita testes

**Exemplo**:
```typescript
// useProducts.ts - Encapsula toda lógica de produtos
export function useProducts(params) { ... }
export function useCreateProduct() { ... }
export function useUpdateProduct() { ... }
```

**Benefícios**:
- Componentes mais limpos
- Lógica reutilizável
- Fácil mockar para testes

---

### Validação com Zod

**Decisão**: Validação no frontend com Zod + React Hook Form.

**Justificativa**:
- Validação em tempo real
- Type-safe (TypeScript)
- Mensagens de erro consistentes
- Validação no frontend e backend (defense in depth)

**Exemplo**:
```typescript
export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  price: z.number().positive().min(0.01),
  currency: z.string().length(3).regex(/^[A-Z]{3}$/),
  // ...
});
```

**Benefícios**:
- Feedback imediato ao usuário
- Previne requisições inválidas
- Type safety end-to-end

---

## Infraestrutura

### Docker Compose

**Decisão**: Containerização completa com Docker Compose.

**Justificativa**:
- Ambiente consistente entre desenvolvimento e produção
- Fácil setup (um comando)
- Isolamento de serviços
- Health checks para garantir disponibilidade

**Serviços**:
- **MongoDB**: Banco de dados principal
- **PostgreSQL**: Banco do Keycloak
- **Redis**: Cache distribuído
- **Keycloak**: Autenticação e autorização
- **API (.NET)**: Backend
- **Frontend (Next.js)**: Frontend
- **Nginx**: Reverse proxy
- **Mongo Express**: Interface web para MongoDB

**Benefícios**:
- Setup rápido (docker-compose up -d)
- Reproduzível em qualquer ambiente
- Fácil escalar horizontalmente

---

### MongoDB

**Decisão**: Uso do MongoDB como banco de dados principal.

**Justificativa**:
- Flexibilidade de schema (útil para evolução)
- Performance para leitura (índices otimizados)
- Suporte nativo a documentos JSON
- Escalabilidade horizontal

**Otimizações Implementadas**:
- **Índices**: Text search, índices compostos para filtros
- **Paginação**: No banco (Skip/Limit), não em memória
- **Soft Delete**: Campo IsDeleted ao invés de deletar fisicamente

**Exemplo de Índice**:
```csharp
// Índice composto para busca eficiente
new CreateIndexModel<Product>(
    Builders<Product>.IndexKeys
        .Ascending(p => p.CategoryId)
        .Ascending(p => p.IsDeleted),
    new CreateIndexOptions { Name = "idx_products_category_deleted" }
)
```

**Benefícios**:
- Queries rápidas mesmo com grandes volumes
- Facilita evolução do schema
- Recuperação de dados deletados (soft delete)

---

### Redis para Cache

**Decisão**: Redis como cache distribuído.

**Justificativa**:
- Cache compartilhado entre múltiplas instâncias
- Performance (memória)
- TTL automático
- Suporta estruturas complexas

**Implementação**:
- **CachingBehavior**: Cache automático para queries
- **Fallback**: Memory cache se Redis não disponível
- **TTL Configurável**: Por query (padrão: 5 minutos)

**Benefícios**:
- Reduz carga no banco de dados
- Melhora tempo de resposta
- Escalável horizontalmente

---

### Keycloak para Autenticação

**Decisão**: Keycloak para autenticação e autorização.

**Justificativa**:
- Solução enterprise-grade
- Suporte a OAuth2/OpenID Connect
- Gerenciamento centralizado de usuários e roles
- SSO (Single Sign-On) ready

**Configuração**:
- **Realm**: `nexus` pré-configurado
- **Client**: `nexus-frontend` (público)
- **Roles**: admin, editor, leitor
- **Usuários de teste**: Pré-criados

**Benefícios**:
- Segurança enterprise
- Fácil adicionar novos métodos de autenticação (SAML, LDAP)
- Gerenciamento centralizado

---

### Nginx como Reverse Proxy

**Decisão**: Nginx para roteamento e load balancing.

**Justificativa**:
- Performance (alta concorrência)
- SSL/TLS termination
- Load balancing (preparado para múltiplas instâncias)
- Cache de assets estáticos

**Configuração**:
- Roteamento para frontend, API e Keycloak
- Health check endpoint
- Preparado para SSL

**Benefícios**:
- Ponto de entrada único
- Fácil adicionar SSL
- Preparado para produção

---

## Segurança

### Múltiplas Camadas de Validação

**Decisão**: Validação em frontend (Zod), backend (FluentValidation) e sanitização.

**Justificativa**:
- Defense in depth
- Previne XSS e injection attacks
- Melhor UX (validação em tempo real)

**Camadas**:
1. **Frontend (Zod)**: Validação em tempo real
2. **Backend (FluentValidation)**: Validação de entrada
3. **Sanitização (InputSanitizer)**: Limpeza de inputs perigosos

**Exemplo**:
```csharp
// Handler sanitiza inputs antes de processar
var sanitizedName = InputSanitizer.Sanitize(request.Product.Name);
var sanitizedDescription = InputSanitizer.Sanitize(request.Product.Description);
```

**Benefícios**:
- Proteção em múltiplas camadas
- Previne bypass de validação frontend
- Sanitização previne XSS e injection

---

### Security Headers

**Decisão**: Middleware customizado para adicionar headers de segurança.

**Justificativa**:
- Proteção contra ataques comuns (XSS, clickjacking, MIME sniffing)
- Compliance com boas práticas de segurança
- Configurável por rota (ex: Swagger tem CSP mais permissivo)

**Headers Implementados**:
- **Content-Security-Policy**: Previne XSS
- **X-Frame-Options**: Previne clickjacking
- **X-Content-Type-Options**: Previne MIME sniffing
- **Referrer-Policy**: Controla informações de referrer
- **Permissions-Policy**: Desabilita features não usadas

**Benefícios**:
- Proteção adicional sem impacto em performance
- Compliance com OWASP Top 10
- Configurável por contexto

---

### Rate Limiting

**Decisão**: Rate limiting por usuário (100 req/min).

**Justificativa**:
- Previne abuso e DDoS
- Protege recursos do servidor
- Justo (por usuário, não global)

**Implementação**:
```csharp
options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: context.User.Identity?.Name ?? context.Connection.RemoteIpAddress?.ToString(),
        factory: partition => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 100,
            Window = TimeSpan.FromMinutes(1)
        }));
```

**Benefícios**:
- Proteção contra abuso
- Não afeta usuários legítimos
- Configurável por endpoint se necessário

---

## Performance

### Cache Automático com CachingBehavior

**Decisão**: Cache transparente via Pipeline Behavior do MediatR.

**Justificativa**:
- Cache automático sem modificar handlers
- Configurável por query (TTL customizado)
- Fácil desabilitar se necessário

**Implementação**:
```csharp
public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : ICacheableQuery<TResponse>
{
    // Verifica cache antes, salva após execução
}
```

**Benefícios**:
- Reduz carga no banco
- Melhora tempo de resposta
- Transparente para handlers

---

### Índices Otimizados no MongoDB

**Decisão**: Criação automática de índices na inicialização.

**Justificativa**:
- Queries rápidas mesmo com grandes volumes
- Índices compostos para queries complexas
- Text search para busca por nome

**Índices Criados**:
- Text search em `Name`
- Composto: `CategoryId + IsDeleted`
- Composto: `StockQuantity + IsDeleted`
- Composto: `IsDeleted + CreatedAt` (para paginação)

**Benefícios**:
- Performance consistente
- Escalável para grandes volumes
- Otimizado para queries mais comuns

---

### Paginação no Banco de Dados

**Decisão**: Paginação usando Skip/Limit do MongoDB, não em memória.

**Justificativa**:
- Eficiente mesmo com milhões de registros
- Reduz uso de memória
- Performance consistente

**Implementação**:
```csharp
var itemsTask = _collection
    .Find(filter)
    .SortByDescending(p => p.CreatedAt)
    .Skip((page - 1) * pageSize)
    .Limit(pageSize)
    .ToListAsync(cancellationToken);
```

**Benefícios**:
- Escalável
- Baixo uso de memória
- Performance previsível

---

### Execução Paralela de Queries

**Decisão**: Uso de `Task.WhenAll` para queries independentes.

**Justificativa**:
- Reduz tempo total de resposta
- Aproveita I/O assíncrono
- Especialmente útil em dashboards

**Exemplo**:
```csharp
// Dashboard busca múltiplas estatísticas em paralelo
var totalProductsTask = _productRepository.CountAsync(cancellationToken);
var totalStockValueTask = _productRepository.GetTotalStockValueAsync(cancellationToken);
var lowStockProductsTask = _productRepository.GetLowStockProductsAsync(10, cancellationToken);

await Task.WhenAll(totalProductsTask, totalStockValueTask, lowStockProductsTask);
```

**Benefícios**:
- Reduz tempo de resposta significativamente
- Melhor uso de recursos
- UX melhor (dados aparecem mais rápido)

---

## Observabilidade

### Logging Estruturado com Serilog

**Decisão**: Serilog para logging estruturado.

**Justificativa**:
- Logs estruturados (JSON) facilitam análise
- CorrelationId para rastreamento
- Configurável (console, arquivo, etc.)

**Configuração**:
```csharp
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();
```

**Benefícios**:
- Fácil análise e busca
- Rastreamento de requisições
- Preparado para ferramentas de monitoramento

---

### Performance Monitoring Middleware

**Decisão**: Middleware customizado para monitorar tempo de resposta.

**Justificativa**:
- Identifica endpoints lentos
- Alerta quando excede threshold (500ms)
- Header customizado com tempo de resposta

**Implementação**:
```csharp
if (elapsedMs > _thresholdMs)
{
    _logger.LogWarning("SLOW REQUEST: {Method} {Path} respondeu em {ElapsedMs}ms");
}
```

**Benefícios**:
- Identificação proativa de problemas
- Métricas para otimização
- Debug facilitado (header X-Response-Time-Ms)

---

### Authentication Logging Middleware

**Decisão**: Logging detalhado de autenticação e autorização.

**Justificativa**:
- Auditoria de acesso
- Debug de problemas de autorização
- Rastreamento de tentativas de acesso não autorizado

**Informações Logadas**:
- Usuário e roles
- Endpoint acessado
- Status (sucesso, 401, 403)
- CorrelationId

**Benefícios**:
- Auditoria completa
- Debug facilitado
- Segurança (detecção de tentativas de acesso)

---

### Health Checks

**Decisão**: Health checks para todos os serviços.

**Justificativa**:
- Monitoramento de saúde dos serviços
- Integração com orquestradores (Kubernetes, Docker Swarm)
- Detecção proativa de problemas

**Endpoints**:
- `/health` e `/api/health`: Health check da API
- Health checks configurados no Docker Compose

**Benefícios**:
- Monitoramento automatizado
- Integração com ferramentas de orquestração
- Detecção precoce de problemas

---

## Alternativas Consideradas

### Backend

| Decisão | Alternativa Considerada | Razão da Escolha |
|---------|------------------------|------------------|
| **MongoDB** | PostgreSQL, SQL Server | Flexibilidade de schema, performance para leitura |
| **MediatR** | Service Layer tradicional | Separação CQRS, pipeline behaviors |
| **FluentValidation** | Data Annotations | Mais flexível, mensagens customizadas |
| **Serilog** | NLog, log4net | Logging estruturado, melhor integração |

### Frontend

| Decisão | Alternativa Considerada | Razão da Escolha |
|---------|------------------------|------------------|
| **Next.js 14** | Vite + React | Server Components, melhor performance |
| **React Query** | Redux, Zustand | Cache automático, sincronização |
| **Zod** | Yup, Joi | Type-safe, melhor integração TypeScript |
| **Shadcn/ui** | Material-UI, Chakra UI | Mais controle, melhor performance |

### Infraestrutura

| Decisão | Alternativa Considerada | Razão da Escolha |
|---------|------------------------|------------------|
| **Keycloak** | Auth0, Firebase Auth | Open source, self-hosted |
| **Redis** | Memory Cache, Memcached | Estruturas complexas, persistência |
| **Docker Compose** | Kubernetes, Docker Swarm | Simplicidade, suficiente para o escopo |

---

## Conclusão

As decisões arquiteturais tomadas priorizam:

1. **Escalabilidade**: Arquitetura preparada para crescimento
2. **Manutenibilidade**: Código limpo e bem organizado
3. **Segurança**: Múltiplas camadas de proteção
4. **Performance**: Otimizações em todas as camadas
5. **Observabilidade**: Logging e monitoramento completos

O sistema está preparado para evoluir e escalar conforme necessário, mantendo qualidade e segurança.

---

**Documento criado em**: 2024  
**Versão**: 1.0
