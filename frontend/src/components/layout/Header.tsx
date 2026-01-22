"use client";

import { useKeycloak } from "@/stores/KeycloakContext";
import { Bell, Search, Sun, Moon, LogOut, User, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, logout, hasRole } = useKeycloak();
  const { setTheme, theme } = useTheme();

  // Determina o badge de role para exibição
  const getRoleBadge = () => {
    if (hasRole("admin")) return { label: "Admin", variant: "destructive" as const };
    if (hasRole("manager")) return { label: "Manager", variant: "default" as const };
    if (hasRole("user")) return { label: "User", variant: "secondary" as const };
    return null;
  };

  const roleBadge = getRoleBadge();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6 md:pl-6">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-md">
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar"
            className="w-full bg-background pl-9"
          />
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
             <span className="text-xs text-muted-foreground border rounded px-1 hidden md:inline">⌘ S</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatars/01.png" alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.substring(0, 2).toUpperCase() || 
                   user?.username?.substring(0, 2).toUpperCase() || 
                   "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || user?.username}
                  </p>
                  {roleBadge && (
                    <Badge variant={roleBadge.variant} className="text-xs">
                      {roleBadge.label}
                    </Badge>
                  )}
                </div>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                {user?.roles && user.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {user.roles
                      .filter(r => !["default-roles-nexus", "offline_access", "uma_authorization"].includes(r))
                      .slice(0, 3)
                      .map((role) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <User className="h-4 w-4" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Shield className="h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="gap-2 text-destructive">
              <LogOut className="h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
