"use client";

import * as React from "react";
import { useKeycloak } from "@/stores/KeycloakContext";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, Tags, LogOut, Plus, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
];

function MobileSidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-[99] bg-background shadow-md"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col px-4 py-6">
          <SidebarContent onLinkClick={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { logout, hasRole } = useKeycloak();
  const isAdmin = hasRole("admin");

  return (
    <>
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
                  onClick={onLinkClick}
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
        
        {/* Seção Sistema - apenas para admin */}
        {isAdmin && (
          <div className="space-y-2">
            <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Sistema
            </h3>
            <div className="space-y-1">
              <Link
                href="/settings"
                onClick={onLinkClick}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === "/settings" || pathname.startsWith("/settings")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </div>
              </Link>
            </div>
          </div>
        )}
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
    </>
  );
}

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen w-64 flex-col border-r bg-card px-4 py-6">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />
    </>
  );
}
