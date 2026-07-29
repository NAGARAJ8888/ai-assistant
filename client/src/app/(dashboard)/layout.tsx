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
  MenuIcon,
  XIcon,
  PanelLeftCloseIcon,
} from "lucide-react";
import { useEffect, useCallback } from "react";
import { DashboardProvider, useDashboard } from "./dashboard-context";
import { ConversationSidebar } from "@/components/conversation/conversation-sidebar";

const navItems = [
  { href: "/dashboard", label: "Chat", icon: MessageSquareTextIcon },
  { href: "/documents", label: "Documents", icon: FolderUpIcon },
];

function DashboardInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const {
    mobileDrawerOpen,
    setMobileDrawerOpen,
    conversations,
    selectedId,
    convsLoading,
    convsError,
    onSelect,
    onCreate,
    onRename,
    onDelete,
    onRefresh,
  } = useDashboard();

  // Wrapper to match ConversationSidebar's expected void return type
  const handleCreate = useCallback(
    async (title: string) => {
      await onCreate(title);
    },
    [onCreate]
  );

  // Close drawer on mobile when navigating
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname, setMobileDrawerOpen]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  const toggleDrawer = useCallback(() => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  }, [setMobileDrawerOpen, mobileDrawerOpen]);

  const closeDrawer = useCallback(() => {
    setMobileDrawerOpen(false);
  }, [setMobileDrawerOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile backdrop for unified drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Desktop sidebar — navigation only */}
      <aside
        className={cn(
          "hidden flex-col border-r bg-muted/30 md:relative md:flex md:w-56"
        )}
      >
        {/* Logo / Brand */}
        <div className="flex h-14 shrink-0 items-center gap-2 px-4">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HomeIcon className="size-4" />
          </div>
          <span className="truncate text-sm font-semibold">AI Assistant</span>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
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
                <item.icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        {/* User area */}
        <div className="shrink-0 border-t p-3">
          {isLoaded && isSignedIn && (
            <div className="flex items-center gap-2">
              <UserButton />
            </div>
          )}
        </div>
      </aside>

      {/* Unified mobile drawer */}
      <aside
        className={cn(
          "flex flex-col border-r bg-background transition-transform duration-200",
          "fixed inset-y-0 left-0 z-50 w-80 md:hidden",
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HomeIcon className="size-4" />
          </div>
          <span className="truncate text-sm font-semibold">AI Assistant</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={closeDrawer}
            className="ml-auto min-h-10 min-w-10"
            aria-label="Close drawer"
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        {/* Navigation links */}
        <nav className="shrink-0 space-y-1 px-2 py-3">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={closeDrawer}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2.5 px-3 text-sm",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        <Separator />

        {/* Conversations list */}
        <div className="flex-1 overflow-hidden">
          <ConversationSidebar
            conversations={conversations}
            selectedId={selectedId}
            loading={convsLoading}
            error={convsError}
            onSelect={onSelect}
            onCreate={handleCreate}
            onRename={onRename}
            onDelete={onDelete}
            onRefresh={onRefresh}
          />
        </div>

        <Separator />

        {/* User area */}
        <div className="shrink-0 p-3">
          {isLoaded && isSignedIn && (
            <div className="flex items-center gap-2">
              <UserButton />
              <span className="text-xs text-muted-foreground">
                {isSignedIn ? "Signed in" : ""}
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar with toggle */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleDrawer}
            aria-label={mobileDrawerOpen ? "Close drawer" : "Open drawer"}
            className="min-h-10 min-w-10 md:min-h-8 md:min-w-8"
          >
            {/* Mobile icons */}
            <span className="md:hidden">
              {mobileDrawerOpen ? (
                <XIcon className="size-4" />
              ) : (
                <MenuIcon className="size-4" />
              )}
            </span>
            {/* Desktop sidebar toggle icons */}
            <span className="hidden md:inline-flex">
              <PanelLeftCloseIcon className="size-4" />
            </span>
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
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardInner>{children}</DashboardInner>
    </DashboardProvider>
  );
}

