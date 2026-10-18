import { Catalog } from "@/components/catalog";
import { PageHeading } from "@/components/page-heading";
import { getProducts } from "@/lib/queries";
export const metadata = { title: "Jelajahi Peralatan" };
export default async function Page() {
  return (
    <>
      <PageHeading
        eyebrow="KATALOG PERALATAN"
        title="Alat yang tepat. Karya yang hebat."
        description="Dari proyek pertama sampai ide berikutnya. Temukan teknologi untuk mewujudkannya. Semua harga merupakan harga demo ilustratif."
      />
      <div className="container">
        <Catalog products={await getProducts()} />
      </div>
    </>
  );
}
