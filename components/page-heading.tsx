import Link from "next/link";
import { ChevronRight } from "lucide-react";
export function PageHeading({
  title,
  eyebrow,
  description,
}: {
  title: string;
  eyebrow: string;
  description?: string;
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Beranda</Link>
          <ChevronRight size={12} />
          <span>{eyebrow}</span>
        </div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </section>
  );
}
