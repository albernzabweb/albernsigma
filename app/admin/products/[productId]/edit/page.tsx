import { getProduct } from "@/lib/queries";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/forms";
export default async function Page({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const p = await getProduct(productId);
  if (!p) notFound();
  return <ProductForm product={p} />;
}
