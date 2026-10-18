import { PageHeading } from "@/components/page-heading";
import { Faq } from "@/components/ui/faq";
export const metadata = { title: "Pertanyaan Umum" };
export default function Page() {
  return (
    <>
      <PageHeading
        eyebrow="PERTANYAAN UMUM"
        title="Semua jadi lebih jelas."
        description="Kenali proses sewa, deposit, pengiriman, dan mode demonstrasi."
      />
      <div className="container content-page content-narrow">
        <Faq />
      </div>
    </>
  );
}
