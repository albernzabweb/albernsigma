import { Catalog } from "@/components/catalog";
import { PageHeading } from "@/components/page-heading";
import { getProducts } from "@/lib/queries";
import { categories } from "@/lib/data";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = categories.find((c) => c.slug === slug);
  if (!c) notFound();
  return (
    <>
      <PageHeading
        eyebrow="KOLEKSI ALBENCAM"
        title={c.name}
        description={c.description + " Harga ilustratif untuk demonstrasi."}
      />
      <div className="container">
        <Catalog products={await getProducts()} category={slug} />
      </div>
    </>
  );
}
