using System.Diagnostics;

var projectRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
var apiProjectPath = Path.Combine(projectRoot, "src", "Nexus.API", "Nexus.API.csproj");

if (!File.Exists(apiProjectPath))
{
    Console.Error.WriteLine($"Projeto da API nao encontrado em: {apiProjectPath}");
    return 1;
}

var startInfo = new ProcessStartInfo("dotnet")
{
    WorkingDirectory = Path.GetDirectoryName(apiProjectPath) ?? projectRoot,
    UseShellExecute = false
};

startInfo.ArgumentList.Add("run");
startInfo.ArgumentList.Add("--project");
startInfo.ArgumentList.Add(apiProjectPath);

if (args.Length > 0)
{
    startInfo.ArgumentList.Add("--");
    foreach (var arg in args)
    {
        startInfo.ArgumentList.Add(arg);
    }
}

using var process = Process.Start(startInfo);
if (process is null)
{
    Console.Error.WriteLine("Falha ao iniciar o processo dotnet.");
    return 1;
}

process.WaitForExit();
return process.ExitCode;
