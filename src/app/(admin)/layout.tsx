import { CustomSidebar } from "@/components/custom-sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "dashboard",
    },
    {
      title: "Eventos",
      url: "eventos",
    },
  ],
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute adminOnly>
      <SidebarProvider>
        <CustomSidebar user={data.user} navMain={data.navMain} />
        <main className="w-full">
          <SidebarTrigger />
          <div className="p-4 md:px-6">{children}</div>
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
