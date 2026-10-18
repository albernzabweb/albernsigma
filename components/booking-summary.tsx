import { type Booking } from "@/lib/data";
import { money, dateLabel } from "@/lib/utils";
import { ProductImage } from "./product-image";
export function BookingSummary({ booking: b }: { booking: Booking }) {
  return (
    <aside className="order-summary">
      <div className="summary-product">
        <div className="mini-art">
          <ProductImage
            src={b.products.image}
            alt={"Ilustrasi " + b.products.name}
          />
        </div>
        <div>
          <h3>{b.products.name}</h3>
          <p>
            {dateLabel(b.start_date)} – {dateLabel(b.end_date)}
          </p>
        </div>
      </div>
      <div className="price-line">
        <span>Durasi</span>
        <strong>{b.rental_days} hari</strong>
      </div>
      <div className="price-line">
        <span>Biaya sewa</span>
        <strong>{money(b.subtotal)}</strong>
      </div>
      <div className="price-line">
        <span>Deposit dapat dikembalikan</span>
        <strong>{money(b.deposit)}</strong>
      </div>
      <div className="price-line">
        <span>Pengiriman</span>
        <strong>{money(b.delivery_fee)}</strong>
      </div>
      <div className="price-line total">
        <span>Total awal demo</span>
        <strong>{money(b.total)}</strong>
      </div>
      <p className="note">
        Nomor pesanan: {b.id}
        <br />
        Penerima: {b.customer_name}
        <br />
        {b.fulfillment === "delivery"
          ? "Dikirim ke: " + b.address
          : "Ambil sendiri · lokasi dikonfirmasi admin"}
      </p>
    </aside>
  );
}
