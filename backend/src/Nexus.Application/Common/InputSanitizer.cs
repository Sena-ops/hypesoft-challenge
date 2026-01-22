using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace Nexus.Application.Common;

/// <summary>
/// Utilitário para sanitização de inputs do usuário
/// Previne XSS, injection attacks e outros problemas de segurança
/// </summary>
public static class InputSanitizer
{
    // Padrões perigosos que devem ser removidos ou escapados
    private static readonly Regex ScriptTagPattern = new(
        @"<script[^>]*>.*?</script>", 
        RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled);
    
    private static readonly Regex EventHandlerPattern = new(
        @"on\w+\s*=", 
        RegexOptions.IgnoreCase | RegexOptions.Compiled);
    
    private static readonly Regex JavaScriptProtocolPattern = new(
        @"javascript\s*:", 
        RegexOptions.IgnoreCase | RegexOptions.Compiled);
    
    private static readonly Regex DataProtocolPattern = new(
        @"data\s*:", 
        RegexOptions.IgnoreCase | RegexOptions.Compiled);
    
    private static readonly Regex VbScriptProtocolPattern = new(
        @"vbscript\s*:", 
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    /// <summary>
    /// Sanitiza uma string removendo ou escapando conteúdo perigoso
    /// </summary>
    public static string Sanitize(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        var original = input;
        
        // Remove tags script
        var sanitized = ScriptTagPattern.Replace(input, string.Empty);
        
        // Remove event handlers (onclick, onerror, etc)
        sanitized = EventHandlerPattern.Replace(sanitized, string.Empty);
        
        // Remove protocolos perigosos
        sanitized = JavaScriptProtocolPattern.Replace(sanitized, string.Empty);
        sanitized = DataProtocolPattern.Replace(sanitized, string.Empty);
        sanitized = VbScriptProtocolPattern.Replace(sanitized, string.Empty);
        
        // Remove caracteres de controle (exceto quebras de linha e tabs)
        sanitized = Regex.Replace(sanitized, @"[\x00-\x08\x0B-\x0C\x0E-\x1F]", string.Empty);
        
        // Se após sanitização ficou vazio mas o original tinha conteúdo, retorna o original
        // (isso previne que inputs válidos sejam perdidos por sanitização excessiva)
        if (string.IsNullOrWhiteSpace(sanitized) && !string.IsNullOrWhiteSpace(original))
        {
            // Se o original não tinha conteúdo perigoso, retorna ele mesmo
            // Caso contrário, retorna vazio (input era realmente perigoso)
            if (!ScriptTagPattern.IsMatch(original) && 
                !EventHandlerPattern.IsMatch(original) &&
                !JavaScriptProtocolPattern.IsMatch(original) &&
                !DataProtocolPattern.IsMatch(original) &&
                !VbScriptProtocolPattern.IsMatch(original))
            {
                return original.Trim();
            }
            return string.Empty;
        }
        
        // Trim espaços extras
        return sanitized.Trim();
    }

    /// <summary>
    /// HTML encode uma string para prevenir XSS
    /// </summary>
    public static string HtmlEncode(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        var encoded = new StringBuilder(input.Length * 2);
        
        foreach (var c in input)
        {
            switch (c)
            {
                case '<':
                    encoded.Append("&lt;");
                    break;
                case '>':
                    encoded.Append("&gt;");
                    break;
                case '"':
                    encoded.Append("&quot;");
                    break;
                case '\'':
                    encoded.Append("&#x27;");
                    break;
                case '&':
                    encoded.Append("&amp;");
                    break;
                case '/':
                    encoded.Append("&#x2F;");
                    break;
                default:
                    if (c > 0x7E || c < 0x20)
                    {
                        encoded.Append($"&#{(int)c};");
                    }
                    else
                    {
                        encoded.Append(c);
                    }
                    break;
            }
        }
        
        return encoded.ToString();
    }

    /// <summary>
    /// Sanitiza e HTML encode uma string
    /// </summary>
    public static string SanitizeAndEncode(string? input)
    {
        var sanitized = Sanitize(input);
        return HtmlEncode(sanitized);
    }

    /// <summary>
    /// Valida se uma string contém apenas caracteres alfanuméricos e espaços
    /// </summary>
    public static bool IsAlphanumeric(string? input, bool allowSpaces = true)
    {
        if (string.IsNullOrWhiteSpace(input))
            return false;

        var pattern = allowSpaces 
            ? @"^[a-zA-Z0-9\s]+$" 
            : @"^[a-zA-Z0-9]+$";
            
        return Regex.IsMatch(input, pattern);
    }

    /// <summary>
    /// Valida se uma string não contém caracteres perigosos para MongoDB
    /// </summary>
    public static bool IsSafeForMongoDb(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return true;

        // Caracteres perigosos em queries MongoDB
        var dangerousChars = new[] { '$', '{', '}', '[', ']', '(', ')', ';', '|', '&', '<', '>' };
        
        return !dangerousChars.Any(c => input.Contains(c));
    }

    /// <summary>
    /// Remove caracteres perigosos para MongoDB de uma string
    /// IMPORTANTE: Para IDs (GUIDs), use apenas validação, não sanitização
    /// </summary>
    public static string SanitizeForMongoDb(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Para IDs (GUIDs), apenas valida, não remove caracteres
        // GUIDs contêm hífens que são válidos
        if (Guid.TryParse(input, out _))
        {
            return input; // GUIDs são seguros, retorna como está
        }

        // Para outros inputs (como search terms), remove caracteres perigosos
        var dangerousChars = new[] { '$', '{', '}', '[', ']', '(', ')', ';', '|', '&' };
        var sanitized = input;
        
        foreach (var c in dangerousChars)
        {
            sanitized = sanitized.Replace(c.ToString(), string.Empty);
        }
        
        var trimmed = sanitized.Trim();
        // Se o trim resultar em string vazia mas o original tinha conteúdo, preserva o sanitizado sem trim
        if (string.IsNullOrWhiteSpace(trimmed) && !string.IsNullOrWhiteSpace(sanitized))
        {
            return sanitized;
        }
        
        return trimmed;
    }
}
