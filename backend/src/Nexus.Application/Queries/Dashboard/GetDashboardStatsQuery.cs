using MediatR;
using Nexus.Application.Behaviors;
using Nexus.Application.Common;
using Nexus.Application.DTOs.Dashboard;

namespace Nexus.Application.Queries.Dashboard;

public class GetDashboardStatsQuery : ICacheableQuery<DashboardStatsDto>
{
    public string CacheKey => CacheKeys.DashboardStats;
    public TimeSpan? CacheExpiration => TimeSpan.FromMinutes(2); // Dashboard atualiza mais frequentemente
}
