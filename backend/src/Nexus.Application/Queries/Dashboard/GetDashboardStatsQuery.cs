using MediatR;
using Nexus.Application.DTOs.Dashboard;

namespace Nexus.Application.Queries.Dashboard;

public class GetDashboardStatsQuery : IRequest<DashboardStatsDto>
{
}
