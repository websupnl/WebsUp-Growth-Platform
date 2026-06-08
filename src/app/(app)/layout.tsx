import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { isAuthenticated, signOut } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  async function logout() {
    "use server";
    await signOut();
    redirect("/login");
  }

  return (
    <div className="flex">
      <Sidebar logout={logout} />
      <main className="h-screen flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
