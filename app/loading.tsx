export default function Loading() {
  return (
    <div
      className="container loading-grid"
      aria-label="Memuat halaman"
      role="status"
    >
      {[0, 1, 2, 3].map((i) => (
        <div className="skeleton" key={i} />
      ))}
    </div>
  );
}
