import { requireUser } from "@/lib/queries";
import { ProfileForm } from "@/components/forms";
export default async function Page() {
  const s = await requireUser();
  return (
    <>
      <div className="dash-heading">
        <div>
          <h1>Kenalan lebih dekat.</h1>
          <p>{s.user.email} · Email dikelola melalui Supabase Auth.</p>
        </div>
      </div>
      <ProfileForm
        name={s.profile?.name ?? ""}
        phone={s.profile?.phone ?? ""}
      />
    </>
  );
}
