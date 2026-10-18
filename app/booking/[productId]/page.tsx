import { notFound } from "next/navigation";
import { getProduct, requireUser } from "@/lib/queries";
import { today } from "@/lib/utils";
import { BookingForm } from "@/components/forms";
import { PageHeading } from "@/components/page-heading";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ start?: string; end?: string; fulfillment?: string }>;
}) {
  const { productId } = await params;
  const q = await searchParams;
  const p = await getProduct(productId);
  if (!p) notFound();
  const suffix =
    "?" +
    new URLSearchParams({
      start: q.start ?? today(),
      end: q.end ?? today(),
      fulfillment: q.fulfillment ?? "pickup",
    });
  const s = await requireUser("/booking/" + productId + suffix);
  return (
    <>
      <PageHeading
        eyebrow="PEMESANAN / 01"
        title="Satu langkah lebih dekat."
        description="Atur waktu sewa dan lengkapi detailmu. Kami akan memeriksa ketersediaan alat secara langsung."
      />
      <div className="container content-page">
        <BookingForm
          product={p}
          start={q.start ?? today()}
          end={q.end ?? today()}
          fulfillment={q.fulfillment ?? "pickup"}
          name={s.profile?.name ?? ""}
          phone={s.profile?.phone ?? ""}
        />
      </div>
    </>
  );
}
