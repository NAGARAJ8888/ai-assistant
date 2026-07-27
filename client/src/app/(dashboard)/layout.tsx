"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  MessageSquareTextIcon,
  FolderUpIcon,
  HomeIcon,
  PanelLeftCloseIcon,
  PanelRightCloseIcon,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Chat", icon: MessageSquareTextIcon },
  { href: "/documents", label: "Documents", icon: FolderUpIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r bg-muted/30 transition-all duration-200",
          sidebarOpen ? "w-56" : "w-0 overflow-hidden border-r-0"
        )}
      >
        {/* Logo / Brand */}
        <div className="flex h-14 items-center gap-2 px-4">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HomeIcon className="size-4" />
          </div>
          {sidebarOpen && (
            <span className="text-sm font-semibold truncate">
              AI Assistant
            </span>
          )}
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-3">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2.5 px-3 text-sm",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                {sidebarOpen && <span>{item.label}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        {/* User area */}
        <div className="border-t p-3">
          {isLoaded && isSignedIn && (
            <div className="flex items-center gap-2">
              <UserButton />
              {sidebarOpen && (
                <span className="truncate text-xs text-muted-foreground">
                  {/* User name will be handled by Clerk */}
                </span>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar with toggle */}
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <PanelLeftCloseIcon className="size-4" />
            ) : (
              <PanelRightCloseIcon className="size-4" />
            )}
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            {pathname === "/dashboard"
              ? "Chat"
              : pathname === "/documents"
                ? "Documents"
                : ""}
          </span>
        </header>

        {/* Page content */}
        <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

