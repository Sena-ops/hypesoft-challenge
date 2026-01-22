using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Nexus.Application.Behaviors;
using System.Reflection;

namespace Nexus.Application.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddMediatR(cfg => 
        {
            cfg.RegisterServicesFromAssembly(assembly);
            
            // Registrar behavior de cache para queries
            cfg.AddOpenBehavior(typeof(CachingBehavior<,>));
        });
        
        services.AddValidatorsFromAssembly(assembly);
        services.AddAutoMapper(assembly);

        return services;
    }
}
