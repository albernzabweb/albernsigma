import { requireUser } from "@/lib/queries";
import { DashboardNav } from "@/components/dashboard-nav";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <div className="container dashboard-shell">
      <DashboardNav admin={false} />
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
