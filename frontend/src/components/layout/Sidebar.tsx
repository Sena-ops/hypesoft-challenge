"use client";

import { useAuth } from "@/stores/AuthContext";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, Users, FileText, MessageSquare, Settings, HelpCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  {
    title: "General",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Statistics",
        href: "/statistics",
        icon: FileText, // Using FileText as placeholder for Statistics icon
      },
    ],
  },
  {
    title: "Shop",
    items: [
      {
        title: "My Shop",
        href: "/shop",
        icon: Package, // Using Package as placeholder for My Shop
      },
      {
        title: "Products",
        href: "/products",
        icon: Package,
      },
      {
        title: "Customers",
        href: "/customers",
        icon: Users,
      },
      {
        title: "Invoice",
        href: "/invoice",
        icon: FileText,
      },
      {
        title: "Message",
        href: "/message",
        icon: MessageSquare,
        badge: 4,
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
      {
        title: "Help",
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
          S
        </div>
        <span className="text-xl font-bold">ShopSense</span>
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
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-500">✨</span>
            <span className="text-sm font-semibold">Try ShopSense Pro</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Get Pro and enjoy 20+ features to enhance your sales. Free 30 days trial!
          </p>
          <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-indigo-500/20" size="sm">
            Upgrade Plan
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full mt-4 justify-start text-muted-foreground hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
