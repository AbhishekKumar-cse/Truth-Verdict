"use client";

import { signOut, User } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { BookCopy, LayoutDashboard, LogOut, PanelLeft, Search } from "lucide-react";

import { auth } from "@/lib/firebase";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TruthLensIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface AppSidebarProps {
    user: User;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const getInitials = (email: string | null) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <TruthLensIcon className="size-8 text-primary" />
            <h1 className="text-xl font-semibold">Truth Lens</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/dashboard")}
              isActive={pathname === "/dashboard"}
              tooltip="Dashboard"
            >
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/reports")}
              isActive={pathname === "/reports"}
              tooltip="My Reports"
            >
              <BookCopy />
              <span>My Reports</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
                 <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">{user.email}</span>
            </div>
            <SidebarMenuButton onClick={handleLogout} variant="ghost" size="icon" className="h-8 w-8 shrink-0" tooltip="Log Out">
                <LogOut />
            </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
