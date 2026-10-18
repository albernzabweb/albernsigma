import { requireAdmin } from "@/lib/queries";
import { DashboardNav } from "@/components/dashboard-nav";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="container dashboard-shell">
      <DashboardNav admin={true} />
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
