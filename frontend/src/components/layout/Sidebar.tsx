"use client";

import { useAuth } from "@/stores/AuthContext";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, Tags, Settings, HelpCircle, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  {
    title: "Geral",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Gestão",
    items: [
      {
        title: "Produtos",
        href: "/products",
        icon: Package,
      },
      {
        title: "Novo Produto",
        href: "/products/new",
        icon: Plus,
      },
      {
        title: "Categorias",
        href: "/categories",
        icon: Tags,
      },
      {
        title: "Nova Categoria",
        href: "/categories/new",
        icon: Plus,
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        title: "Configurações",
        href: "/settings",
        icon: Settings,
      },
      {
        title: "Ajuda",
        href: "/help",
        icon: HelpCircle,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
          N
        </div>
        <span className="text-xl font-bold">Nexus</span>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {sidebarItems.map((group, i) => (
          <div key={i} className="space-y-2">
            <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
