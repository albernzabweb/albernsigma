export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  specifications: Record<string, string>;
  image: string;
  daily_price: number;
  weekly_price: number;
  deposit: number;
  quantity: number;
  available: boolean;
  badge?: string;
};
export const categories = [
  {
    slug: "kamera-lensa",
    name: "Kamera & Lensa",
    icon: "camera",
    description: "Setiap momen, lebih bermakna.",
  },
  {
    slug: "laptop-komputer",
    name: "Laptop & Komputer",
    icon: "laptop",
    description: "Ide besar butuh performa besar.",
  },
  {
    slug: "drone",
    name: "Drone",
    icon: "drone",
    description: "Lihat dunia dari perspektif baru.",
  },
  {
    slug: "proyektor",
    name: "Proyektor",
    icon: "projector",
    description: "Cerita besar di layar yang lebih besar.",
  },
  {
    slug: "konsol-game",
    name: "Konsol Game",
    icon: "gamepad",
    description: "Waktunya naik level.",
  },
  {
    slug: "sound-system",
    name: "Sound System",
    icon: "speaker",
    description: "Buat setiap suara terasa.",
  },
];
const records: [
  string,
  string,
  number,
  number,
  number,
  Record<string, string>,
  string?,
][] = [
  [
    "Sony Alpha A7 IV",
    "kamera-lensa",
    250000,
    1500000,
    3,
    {
      Sensor: "Full-frame 33 MP",
      Video: "4K 60p",
      "Lensa kit": "28–70mm f/3.5–5.6",
      Paket: "2 baterai, SD 64 GB, tas",
    },
    "Favorit Kreator",
  ],
  [
    "Canon EOS R6 Mark II",
    "kamera-lensa",
    275000,
    1500000,
    2,
    {
      Sensor: "Full-frame 24.2 MP",
      Video: "4K 60p",
      "Lensa kit": "RF 24–105mm",
      Paket: "Baterai, charger, tas",
    },
  ],
  [
    "Fujifilm X-T5",
    "kamera-lensa",
    225000,
    1200000,
    2,
    {
      Sensor: "APS-C 40.2 MP",
      Video: "6.2K 30p",
      Stabilisasi: "IBIS 7-stop",
      Paket: "Lensa 18–55mm, tas",
    },
    "Pilihan Editor",
  ],
  [
    "MacBook Pro M3 14 inci",
    "laptop-komputer",
    300000,
    2000000,
    3,
    {
      Chip: "Apple M3",
      Memori: "16 GB",
      Penyimpanan: "512 GB SSD",
      Layar: "Liquid Retina XDR",
    },
  ],
  [
    "ASUS ROG Zephyrus G14",
    "laptop-komputer",
    275000,
    1700000,
    2,
    {
      CPU: "Ryzen 9",
      GPU: "RTX 4060",
      Memori: "16 GB",
      Layar: "14 inci 165 Hz",
    },
  ],
  [
    "MacBook Air M2",
    "laptop-komputer",
    180000,
    1200000,
    4,
    {
      Chip: "Apple M2",
      Memori: "8 GB",
      Penyimpanan: "256 GB SSD",
      Layar: "13.6 inci",
    },
  ],
  [
    "DJI Mini 4 Pro",
    "drone",
    300000,
    2000000,
    3,
    {
      Sensor: "1/1.3 inci",
      Video: "4K 60p HDR",
      Baterai: "3 unit",
      Paket: "Fly More Combo",
    },
    "Ringan & Powerful",
  ],
  [
    "DJI Air 3",
    "drone",
    350000,
    2500000,
    2,
    {
      Kamera: "Dual camera",
      Video: "4K 100p",
      "Waktu terbang": "Hingga 46 menit",
      Paket: "Fly More Combo",
    },
  ],
  [
    "DJI Avata 2",
    "drone",
    375000,
    2500000,
    1,
    {
      Pengalaman: "FPV",
      Video: "4K 60p",
      Paket: "Goggles 3, RC Motion 3",
      Baterai: "3 unit",
    },
  ],
  [
    "Epson EB-X500",
    "proyektor",
    150000,
    700000,
    4,
    {
      Kecerahan: "3.600 lumen",
      Resolusi: "XGA",
      Koneksi: "HDMI",
      Paket: "Kabel, remote, tas",
    },
  ],
  [
    "BenQ TH685P",
    "proyektor",
    200000,
    1000000,
    2,
    {
      Resolusi: "Full HD 1080p",
      Kecerahan: "3.500 lumen",
      Refresh: "120 Hz",
      Koneksi: "HDMI",
    },
  ],
  [
    "Anker Nebula Capsule 3",
    "proyektor",
    175000,
    800000,
    0,
    {
      Resolusi: "1080p",
      Tipe: "Portable",
      Audio: "Dolby Digital",
      Koneksi: "Wi-Fi, HDMI",
    },
  ],
  [
    "PlayStation 5 Slim",
    "konsol-game",
    125000,
    800000,
    4,
    {
      Penyimpanan: "1 TB",
      Controller: "2 DualSense",
      Output: "4K",
      Paket: "Kabel HDMI, 2 game",
    },
    "Weekend Essential",
  ],
  [
    "Nintendo Switch OLED",
    "konsol-game",
    100000,
    600000,
    3,
    {
      Layar: "7 inci OLED",
      Controller: "Joy-Con",
      Mode: "TV & handheld",
      Paket: "Dock, 2 game",
    },
  ],
  [
    "Xbox Series X",
    "konsol-game",
    125000,
    800000,
    2,
    {
      Penyimpanan: "1 TB SSD",
      Controller: "2 wireless",
      Output: "4K",
      Paket: "Kabel HDMI",
    },
  ],
  [
    "JBL PartyBox 310",
    "sound-system",
    200000,
    1000000,
    3,
    {
      Daya: "240 W",
      Koneksi: "Bluetooth",
      Baterai: "Hingga 18 jam",
      Paket: "Kabel daya, mic",
    },
  ],
  [
    "Yamaha Stagepas 400BT",
    "sound-system",
    350000,
    1500000,
    2,
    {
      Daya: "400 W",
      Mixer: "8 channel",
      Speaker: "2 unit",
      Paket: "Stand, kabel, mic",
    },
  ],
  [
    "Rode Wireless GO II",
    "sound-system",
    100000,
    600000,
    4,
    {
      Sistem: "Dual channel",
      Transmiter: "2 unit",
      Perekaman: "Internal",
      Paket: "Receiver, kabel, pouch",
    },
  ],
];
export const sampleProducts: Product[] = records.map(
  ([name, category, daily, deposit, quantity, specifications, badge], i) => ({
    id: `10000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    name,
    slug: name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-$/, ""),
    category,
    description: `Wujudkan rencanamu dengan ${name}. Peralatan diperiksa sebelum digunakan dan dilengkapi aksesori esensial. Spesifikasi serta harga di halaman ini adalah data contoh untuk demonstrasi.`,
    specifications,
    image: `/products/${category}.svg`,
    daily_price: daily,
    weekly_price: daily * 6,
    deposit,
    quantity,
    available: quantity > 0,
    badge,
  }),
);
export type Booking = {
  id: string;
  customer_id: string;
  product_id: string;
  start_date: string;
  end_date: string;
  rental_days: number;
  subtotal: number;
  delivery_fee: number;
  deposit: number;
  total: number;
  payment_status: string;
  rental_status: string;
  customer_name: string;
  phone: string;
  fulfillment: string;
  address: string;
  notes: string;
  created_at: string;
  hold_until: string;
  products: { name: string; slug: string; image: string };
};
