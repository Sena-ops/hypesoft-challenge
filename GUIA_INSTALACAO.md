# Guia de Instalação e Execução - Nexus

Este guia fornece instruções detalhadas para instalar e executar o sistema Nexus em diferentes ambientes.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação com Docker Compose (Recomendado)](#instalação-com-docker-compose-recomendado)
- [Instalação para Desenvolvimento Local](#instalação-para-desenvolvimento-local)
- [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
- [Verificação da Instalação](#verificação-da-instalação)
- [Troubleshooting](#troubleshooting)
- [Comandos Úteis](#comandos-úteis)

---

## Pré-requisitos

### Obrigatórios

- **Docker Desktop 4.0+** ou **Docker Engine 20.10+** com **Docker Compose 2.0+**
- **Git** para clonar o repositório
- **4GB de RAM** disponível (recomendado: 8GB)
- **10GB de espaço em disco** livre

### Opcionais (para desenvolvimento local)

- **.NET 9 SDK** (se quiser rodar o backend localmente)
- **Node.js 18+** e **npm** (se quiser rodar o frontend localmente)

> **Nota**: Para uso apenas com Docker Compose, não é necessário ter .NET SDK ou Node.js instalados localmente.

---

## Instalação com Docker Compose (Recomendado)

Esta é a forma mais simples e recomendada para executar o sistema completo.

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/Sena-ops/hypesoft-challenge.git
cd hypesoft-challenge
```

### Passo 2: Configurar Variáveis de Ambiente (Opcional)

O sistema funciona com valores padrão, mas você pode personalizar:

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env com seus valores (opcional)
# O sistema funciona sem este arquivo usando valores padrão
```

### Passo 3: Executar o Sistema

```bash
# Iniciar todos os serviços em background
docker-compose up -d

# Aguardar alguns segundos para os serviços iniciarem
# Verificar status dos containers
docker-compose ps
```

### Passo 4: Aguardar Inicialização Completa

Os serviços levam alguns minutos para iniciar completamente:

- **MongoDB**: ~10-15 segundos
- **PostgreSQL (Keycloak DB)**: ~10-15 segundos
- **Redis**: ~5 segundos
- **Keycloak**: ~2-3 minutos (primeira inicialização)
- **API (.NET)**: ~30-60 segundos
- **Frontend (Next.js)**: ~30-60 segundos

**Verificar logs para confirmar que tudo está pronto:**

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f keycloak
```

### Passo 5: Acessar o Sistema

Após a inicialização, acesse:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000/api
- **Swagger**: http://localhost:5000/swagger
- **Keycloak**: http://localhost:8080
- **MongoDB Express**: http://localhost:8081
- **Nginx (Reverse Proxy)**: http://localhost

---

## Instalação para Desenvolvimento Local

Se você quiser desenvolver localmente sem Docker para alguns serviços:

### Backend Local

#### Pré-requisitos
- .NET 9 SDK
- MongoDB rodando (via Docker ou local)
- Redis rodando (via Docker ou local)
- Keycloak rodando (via Docker)

#### Passos

```bash
cd backend

# Restaurar dependências
dotnet restore

# Executar a API
cd src/Nexus.API
dotnet run
```

A API estará disponível em: http://localhost:5000

**Nota**: Certifique-se de que MongoDB, Redis e Keycloak estejam rodando via Docker Compose.

### Frontend Local

#### Pré-requisitos
- Node.js 18+
- npm ou yarn
- API rodando (via Docker ou local)
- Keycloak rodando (via Docker)

#### Passos

```bash
cd frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

O frontend estará disponível em: http://localhost:3000

**Nota**: Certifique-se de que a API e o Keycloak estejam rodando.

---

## Configuração de Variáveis de Ambiente

### Arquivo .env

Crie um arquivo `.env` na raiz do projeto (baseado em `.env.example`) para personalizar configurações:

```bash
cp .env.example .env
```

### Variáveis Principais

#### MongoDB
```env
MONGO_INITDB_DATABASE=nexus
MONGODB_CONNECTION_STRING=mongodb://mongodb:27017
MONGODB_DATABASE_NAME=nexus
```

#### Keycloak
```env
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_AUTHORITY=http://keycloak:8080/realms/nexus
KEYCLOAK_AUDIENCE=nexus-api
```

#### API (.NET)
```env
ASPNETCORE_ENVIRONMENT=Development
CORS_ALLOWED_ORIGINS=http://localhost:3000
SEED_DATABASE=true
```

#### Frontend (Next.js)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=nexus
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nexus-frontend
```

> **⚠️ IMPORTANTE**: Em produção, altere TODAS as senhas padrão e use valores seguros!

---

## Verificação da Instalação

### 1. Verificar Containers Rodando

```bash
docker-compose ps
```

Todos os containers devem estar com status `Up` e health checks `healthy`:

- ✅ nexus-mongodb
- ✅ nexus-keycloak-db
- ✅ nexus-keycloak
- ✅ nexus-redis
- ✅ nexus-api
- ✅ nexus-frontend
- ✅ nexus-nginx
- ✅ nexus-mongo-express

### 2. Verificar Health Checks

```bash
# Health check da API
curl http://localhost:5000/api/health

# Deve retornar: {"status":"healthy","timestamp":"..."}
```

### 3. Verificar Keycloak

Acesse http://localhost:8080 e faça login com:
- **Usuário**: `admin`
- **Senha**: `admin`

### 4. Verificar Frontend

Acesse http://localhost:3000 e faça login com:
- **Usuário**: `admin@nexus.com`
- **Senha**: `admin123`

### 5. Verificar Swagger

Acesse http://localhost:5000/swagger e verifique se a documentação está disponível.

---

## Credenciais Padrão

### Usuários do Sistema (Keycloak)

| Role | Email | Senha | Permissões |
|------|-------|-------|------------|
| **Admin** | `admin@nexus.com` | `admin123` | Acesso total, gerenciamento de usuários |
| **Editor** | `editor@nexus.com` | `editor123` | Criar, editar e excluir produtos/categorias |
| **Leitor** | `leitor@nexus.com` | `leitor123` | Apenas visualização |

### Serviços

| Serviço | URL | Usuário | Senha |
|---------|-----|---------|-------|
| **Keycloak Admin** | http://localhost:8080 | `admin` | `admin` |
| **MongoDB Express** | http://localhost:8081 | `admin` | `admin` |

---

## Dados de Exemplo

O sistema popula automaticamente o banco de dados na primeira execução com:

- **8 categorias**: Eletrônicos, Roupas, Casa e Jardim, Esportes, Livros, Alimentos, Beleza, Brinquedos
- **40+ produtos** distribuídos nas categorias
- **Produtos com estoque baixo** (< 10 unidades) para demonstrar funcionalidades do dashboard

Para forçar o seed novamente (mesmo com dados existentes):

```bash
# Parar containers
docker-compose down

# Remover volumes (apaga dados)
docker-compose down -v

# Iniciar novamente
docker-compose up -d
```

---

## Troubleshooting

### Problema: Containers não iniciam

**Solução:**
```bash
# Verificar logs
docker-compose logs

# Verificar se as portas estão disponíveis
netstat -an | grep -E "3000|5000|8080|8081|27017|6379"

# Parar containers conflitantes
docker-compose down
```

### Problema: Keycloak demora muito para iniciar

**Solução:**
- Keycloak pode levar 2-3 minutos na primeira inicialização
- Verifique os logs: `docker-compose logs -f keycloak`
- Aguarde até ver a mensagem "Keycloak started"

### Problema: API não conecta ao MongoDB

**Solução:**
```bash
# Verificar se MongoDB está rodando
docker-compose ps mongodb

# Verificar logs do MongoDB
docker-compose logs mongodb

# Verificar conexão
docker-compose exec api curl http://localhost/api/health
```

### Problema: Frontend não conecta à API

**Solução:**
- Verifique se a API está rodando: http://localhost:5000/api/health
- Verifique variáveis de ambiente do frontend
- Verifique CORS configurado na API

### Problema: Erro de autenticação no Keycloak

**Solução:**
- Aguarde Keycloak iniciar completamente (2-3 minutos)
- Verifique se o realm `nexus` foi importado
- Verifique logs: `docker-compose logs keycloak`

### Problema: Banco de dados não é populado

**Solução:**
```bash
# Verificar variável SEED_DATABASE
docker-compose exec api env | grep SEED_DATABASE

# Forçar seed
docker-compose down -v
docker-compose up -d
```

---

## Comandos Úteis

### Gerenciamento de Containers

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (apaga dados)
docker-compose down -v

# Reiniciar um serviço específico
docker-compose restart api

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f keycloak
```

### Rebuild após Mudanças

```bash
# Rebuild e reiniciar todos os serviços
docker-compose up -d --build

# Rebuild apenas um serviço
docker-compose up -d --build api
docker-compose up -d --build frontend
```

### Limpeza

```bash
# Parar e remover containers, volumes e networks
docker-compose down -v

# Remover imagens não utilizadas
docker image prune -a

# Limpeza completa (cuidado!)
docker system prune -a --volumes
```

### Acesso aos Containers

```bash
# Acessar shell do container da API
docker-compose exec api sh

# Acessar MongoDB
docker-compose exec mongodb mongosh

# Acessar Redis CLI
docker-compose exec redis redis-cli

# Acessar PostgreSQL (Keycloak)
docker-compose exec keycloak-db psql -U keycloak -d keycloak
```

### Verificação de Saúde

```bash
# Health check da API
curl http://localhost:5000/api/health

# Health check do Keycloak
curl http://localhost:8080/health/ready

# Verificar status dos containers
docker-compose ps
```

---

## Próximos Passos

Após a instalação bem-sucedida:

1. ✅ Acesse o frontend: http://localhost:3000
2. ✅ Faça login com `admin@nexus.com` / `admin123`
3. ✅ Explore o dashboard e funcionalidades
4. ✅ Teste diferentes roles (admin, editor, leitor)
5. ✅ Consulte a documentação da API no Swagger: http://localhost:5000/swagger

---

## Suporte

Para problemas ou dúvidas:

1. Verifique os logs: `docker-compose logs -f`
2. Consulte a documentação de arquitetura: `DECISOES_ARQUITETURAIS.md`
3. Verifique o README principal: `README.md`

---

**Boa sorte e aproveite o sistema Nexus!** 🚀
