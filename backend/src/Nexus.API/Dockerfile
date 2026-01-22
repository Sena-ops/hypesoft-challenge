FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["src/Nexus.API/Nexus.API.csproj", "src/Nexus.API/"]
COPY ["src/Nexus.Application/Nexus.Application.csproj", "src/Nexus.Application/"]
COPY ["src/Nexus.Infrastructure/Nexus.Infrastructure.csproj", "src/Nexus.Infrastructure/"]
COPY ["src/Nexus.Domain/Nexus.Domain.csproj", "src/Nexus.Domain/"]

RUN dotnet restore "src/Nexus.API/Nexus.API.csproj"

COPY . .
WORKDIR "/src/src/Nexus.API"
RUN dotnet build "Nexus.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Nexus.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Nexus.API.dll"]
