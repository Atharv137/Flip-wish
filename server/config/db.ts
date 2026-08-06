import fs from "fs";
import path from "path";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  discount: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  deliveryDate: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
}

interface DatabaseSchema {
  users: User[];
  products: Product[];
  wishlists: Wishlist[];
  carts: CartItem[];
}

const DATA_DIR = path.join(process.cwd(), "server-data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Helper to calculate delivery date (e.g., 2-4 days from now)
function getFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Apple iPhone 16 Pro (Natural Titanium, 128 GB)",
    description: "Experience the ultimate iPhone with a stunning titanium design, the new Camera Control button, and the revolutionary A18 Pro chip that powers advanced Apple Intelligence.",
    brand: "Apple",
    category: "Smartphones",
    price: 119900,
    discount: 7,
    originalPrice: 129900,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviews: 1420,
    stock: 10,
    deliveryDate: getFutureDate(2)
  },
  {
    id: "p2",
    title: "Samsung Galaxy S25 Ultra (Titanium Gray, 256 GB)",
    description: "The peak of Android innovation. Featuring a 200MP camera system, integrated S Pen, Snapdragon 8 Gen 4, and an immersive 6.8-inch Dynamic AMOLED 2X flat display.",
    brand: "Samsung",
    category: "Smartphones",
    price: 124999,
    discount: 7,
    originalPrice: 134999,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    reviews: 980,
    stock: 5,
    deliveryDate: getFutureDate(3)
  },
  {
    id: "p3",
    title: "Google Pixel 10 (Obsidian, 128 GB)",
    description: "The AI-first phone with Google Tensor G5. Spectacular Magic Eraser, Add Me photo modes, and pristine Android experience with 7 years of feature drops.",
    brand: "Google",
    category: "Smartphones",
    price: 79999,
    discount: 11,
    originalPrice: 89999,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    reviews: 340,
    stock: 8,
    deliveryDate: getFutureDate(2)
  },
  {
    id: "p4",
    title: "OnePlus 14 (Eternal Green, 256 GB)",
    description: "Fast and Smooth redefined. 100W SuperVOOC charging, Hasselblad Camera for Mobile, and a stunning 2K 120Hz Fluid AMOLED display.",
    brand: "OnePlus",
    category: "Smartphones",
    price: 64999,
    discount: 7,
    originalPrice: 69999,
    image: "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=80",
    rating: 4.5,
    reviews: 520,
    stock: 12,
    deliveryDate: getFutureDate(4)
  },
  {
    id: "p5",
    title: "Nothing Phone 3 (Dark Grey, 128 GB)",
    description: "The unique Glyph Interface meets premium specifications. Powered by Snapdragon 8s Gen 3, a clean Nothing OS, and symmetrical minimal bezels.",
    brand: "Nothing",
    category: "Smartphones",
    price: 42999,
    discount: 14,
    originalPrice: 49999,
    image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=600&auto=format&fit=crop&q=80",
    rating: 4.5,
    reviews: 290,
    stock: 3,
    deliveryDate: getFutureDate(3)
  },
  {
    id: "p6",
    title: "Apple MacBook Air M4 (13.6-inch, 16GB RAM, 512GB SSD)",
    description: "Incredibly thin and fast. The new M4 chip delivers spectacular performance and up to 18 hours of battery life in a silent, fanless aluminum chassis.",
    brand: "Apple",
    category: "Laptops",
    price: 114900,
    discount: 8,
    originalPrice: 124900,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviews: 2150,
    stock: 15,
    deliveryDate: getFutureDate(2)
  },
  {
    id: "p7",
    title: "Dell XPS 15 Laptop (Intel Core i9, 32GB RAM, 1TB SSD)",
    description: "Masterful craftsmanship. Boasts a stunning InfinityEdge OLED display, discrete NVIDIA RTX 4060 graphics, and custom machined aluminum palm rest.",
    brand: "Dell",
    category: "Laptops",
    price: 149999,
    discount: 11,
    originalPrice: 169999,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
    rating: 4.5,
    reviews: 410,
    stock: 4,
    deliveryDate: getFutureDate(5)
  },
  {
    id: "p8",
    title: "ASUS ROG Zephyrus G16 Gaming Laptop (RTX 4070)",
    description: "Ultrathin gaming powerhouse. Intel Core Ultra 9, Nebula OLED 240Hz screen, and custom tri-fan cooling system. Ultimate performance in elegant white.",
    brand: "ASUS",
    category: "Laptops",
    price: 179990,
    discount: 10,
    originalPrice: 199990,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviews: 180,
    stock: 0, // Out of Stock Initially
    deliveryDate: getFutureDate(6)
  },
  {
    id: "p9",
    title: "Acer Predator Helios Neo 16 (Intel Core i7, RTX 4060)",
    description: "Crush the competition with a 165Hz display, advanced liquid metal thermal pads, and fully customizable 4-zone RGB backlit gaming keyboard.",
    brand: "Acer",
    category: "Laptops",
    price: 114999,
    discount: 11,
    originalPrice: 129999,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
    rating: 4.4,
    reviews: 320,
    stock: 7,
    deliveryDate: getFutureDate(4)
  },
  {
    id: "p10",
    title: "Lenovo Legion Pro 7 Gaming Laptop (RTX 4080, 1TB)",
    description: "Peak-level eSports performance. AMD Ryzen 9, high-wattage RTX 4080, and revolutionary Legion Coldfront 5.0 vapor chamber technology.",
    brand: "Lenovo",
    category: "Laptops",
    price: 199990,
    discount: 11,
    originalPrice: 224990,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    reviews: 150,
    stock: 3,
    deliveryDate: getFutureDate(3)
  },
  {
    id: "p11",
    title: "Apple Watch Series 11 (GPS, 45mm, Blue Sport Band)",
    description: "Track your health with unmatched precision. ECG sensors, blood oxygen alerts, temperature sensing, and a brighter always-on Retina display.",
    brand: "Apple",
    category: "Smart Watches",
    price: 41900,
    discount: 6,
    originalPrice: 44900,
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    reviews: 840,
    stock: 9,
    deliveryDate: getFutureDate(2)
  },
  {
    id: "p12",
    title: "Samsung Galaxy Watch Ultra (47mm LTE, Titanium Black)",
    description: "Built for extreme challenges. Grade 4 Titanium construction, dual-frequency GPS, up to 100 hours battery life, and localized multi-sport trackers.",
    brand: "Samsung",
    category: "Smart Watches",
    price: 59999,
    discount: 7,
    originalPrice: 64999,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    reviews: 190,
    stock: 6,
    deliveryDate: getFutureDate(3)
  },
  {
    id: "p13",
    title: "Sony WH-1000XM6 Wireless Over-Ear Active Noise Cancelling Headphones",
    description: "Industry-leading active noise cancellation. Custom-engineered V2 audio processor, pristine call quality, and soft pressure-relieving leather cushions.",
    brand: "Sony",
    category: "Headphones",
    price: 29990,
    discount: 14,
    originalPrice: 34990,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviews: 3100,
    stock: 14,
    deliveryDate: getFutureDate(2)
  },
  {
    id: "p14",
    title: "Apple AirPods Pro 3 with Wireless MagSafe Case",
    description: "Revolutionary active noise cancellation and adaptive transparency. Custom spatial audio maps sound dynamically based on your ear shape.",
    brand: "Apple",
    category: "Earbuds",
    price: 24900,
    discount: 7,
    originalPrice: 26900,
    image: "https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    reviews: 4200,
    stock: 2, // Few Left!
    deliveryDate: getFutureDate(2)
  },
  {
    id: "p15",
    title: "Nothing Ear (3) Premium Hi-Res Wireless Earbuds",
    description: "Distinctive transparent design with a personalized sound profile. 11mm ceramic drivers, smart active noise cancellation, and IP54 dust resistance.",
    brand: "Nothing",
    category: "Earbuds",
    price: 9999,
    discount: 16,
    originalPrice: 11999,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    rating: 4.5,
    reviews: 880,
    stock: 11,
    deliveryDate: getFutureDate(3)
  },
  {
    id: "p16",
    title: "Apple iPad Air M3 (11-inch, Wi-Fi, 128GB, Space Grey)",
    description: "Stunning Liquid Retina display, fast M3 chip performance, 12MP landscape ultra-wide camera, and compatibility with Apple Pencil Pro.",
    brand: "Apple",
    category: "Tablets",
    price: 59900,
    discount: 7,
    originalPrice: 64900,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviews: 1150,
    stock: 8,
    deliveryDate: getFutureDate(2)
  },
  {
    id: "p17",
    title: "Samsung Galaxy Tab S11 (Wi-Fi, 12.4-inch AMOLED Screen)",
    description: "An exceptionally vibrant screen, ideal for creators. Comes with the ultra-low latency S Pen, professional-grade quad speakers, and premium metal shell.",
    brand: "Samsung",
    category: "Tablets",
    price: 74999,
    discount: 9,
    originalPrice: 82999,
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    reviews: 450,
    stock: 5,
    deliveryDate: getFutureDate(3)
  },
  {
    id: "p18",
    title: "Canon EOS R50 Mirrorless Camera with 18-45mm Lens",
    description: "Compact creator powerhouse. 24.2 MP APS-C sensor, 4K uncropped video up to 30p, and high-speed Dual Pixel CMOS AF II focus tracking.",
    brand: "Canon",
    category: "Cameras",
    price: 69990,
    discount: 7,
    originalPrice: 75990,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
    rating: 4.5,
    reviews: 210,
    stock: 4,
    deliveryDate: getFutureDate(4)
  },
  {
    id: "p19",
    title: "Sony ZV-E10 II Vlog Camera with Creator Accessory Kit",
    description: "Designed specifically for vloggers. Large APS-C sensor, fully articulating touchscreen, multi-directional 3-capsule mic, and easy background defocus.",
    brand: "Sony",
    category: "Cameras",
    price: 74990,
    discount: 6,
    originalPrice: 79990,
    image: "https://images.unsplash.com/photo-1519638396419-db2c66031853?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    reviews: 140,
    stock: 0, // Out of stock initially
    deliveryDate: getFutureDate(5)
  },
  {
    id: "p20",
    title: "Sony PlayStation 5 Slim Console (C-Chassis)",
    description: "Enjoy ultra-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback support, adaptive triggers, and 3D Audio.",
    brand: "Sony",
    category: "Gaming Consoles",
    price: 44990,
    discount: 18,
    originalPrice: 54990,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviews: 5200,
    stock: 6,
    deliveryDate: getFutureDate(2)
  },
  {
    id: "p21",
    title: "Xbox Series X Console (1TB Carbon Black)",
    description: "The fastest, most powerful Xbox ever. Native 4K gaming, up to 120 FPS, and Quick Resume allowing you to bounce seamlessly between multiple titles.",
    brand: "Microsoft",
    category: "Gaming Consoles",
    price: 49990,
    discount: 10,
    originalPrice: 55990,
    image: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    reviews: 1800,
    stock: 4,
    deliveryDate: getFutureDate(3)
  },
  {
    id: "p22",
    title: "LG UltraGear IPS Gaming Monitor (27-inch, 165Hz, 1ms)",
    description: "Superb gaming graphics. Full HD resolution, 165Hz refresh rate with 1ms MBR, and NVIDIA G-SYNC / AMD FreeSync Premium compatibility.",
    brand: "LG",
    category: "Monitors",
    price: 32990,
    discount: 17,
    originalPrice: 39990,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    reviews: 920,
    stock: 7,
    deliveryDate: getFutureDate(4)
  },
  {
    id: "p23",
    title: "Logitech MX Keys S Wireless Backlit Keyboard",
    description: "Master level typing precision. Low-profile tactile keys, smart fluid backlighting that turns on automatically, and customizable macro shortcuts.",
    brand: "Logitech",
    category: "Keyboards",
    price: 12995,
    discount: 13,
    originalPrice: 14995,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    reviews: 1540,
    stock: 10,
    deliveryDate: getFutureDate(3)
  },
  {
    id: "p24",
    title: "Logitech MX Master 3S Ergonomic Wireless Mouse",
    description: "An absolute icon. Quiet Clicks, 8000 DPI track-anywhere sensor, and the legendary MagSpeed scroll wheel that spins 1000 lines per second.",
    brand: "Logitech",
    category: "Mouse",
    price: 10995,
    discount: 8,
    originalPrice: 11995,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviews: 2310,
    stock: 15,
    deliveryDate: getFutureDate(2)
  },
  {
    id: "p25",
    title: "JBL Charge 6 Bluetooth Waterproof Portable Speaker",
    description: "Bold JBL Original Pro Sound. Featuring an optimized long-excursion driver, separate tweeter, and dual pumping bass radiators with 20 hours play time.",
    brand: "JBL",
    category: "Speakers",
    price: 14999,
    discount: 16,
    originalPrice: 17999,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    reviews: 1100,
    stock: 8,
    deliveryDate: getFutureDate(3)
  }
];

class LocalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      users: [],
      products: [],
      wishlists: [],
      carts: []
    };
    this.initialize();
  }

  private initialize() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);

        // Ensure products are fully seeded if file was empty or missing some products
        if (!this.data.products || this.data.products.length === 0) {
          this.data.products = [...DEFAULT_PRODUCTS];
          this.save();
        }
      } else {
        this.data.users = [];
        this.data.products = [...DEFAULT_PRODUCTS];
        this.data.wishlists = [];
        this.data.carts = [];
        this.save();
      }
    } catch (error) {
      console.error("Failed to initialize JSON database:", error);
      this.data.products = [...DEFAULT_PRODUCTS];
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save database file:", error);
    }
  }

  // --- Users Table ---
  public users = {
    find: (): User[] => {
      this.initialize();
      return this.data.users;
    },
    findOne: (predicate: (u: User) => boolean): User | undefined => {
      this.initialize();
      return this.data.users.find(predicate);
    },
    insert: (user: Omit<User, "id">): User => {
      this.initialize();
      const newUser: User = {
        ...user,
        id: "u_" + Math.random().toString(36).substr(2, 9)
      };
      this.data.users.push(newUser);
      this.save();
      return newUser;
    }
  };

  // --- Products Table ---
  public products = {
    find: (filter?: (p: Product) => boolean): Product[] => {
      this.initialize();
      if (filter) {
        return this.data.products.filter(filter);
      }
      return this.data.products;
    },
    findOne: (predicate: (p: Product) => boolean): Product | undefined => {
      this.initialize();
      return this.data.products.find(predicate);
    },
    insert: (product: Omit<Product, "id">): Product => {
      this.initialize();
      const newProduct: Product = {
        ...product,
        id: "p_" + Math.random().toString(36).substr(2, 9)
      };
      this.data.products.push(newProduct);
      this.save();
      return newProduct;
    },
    update: (id: string, updates: Partial<Product>): Product | undefined => {
      this.initialize();
      const index = this.data.products.findIndex(p => p.id === id);
      if (index !== -1) {
        this.data.products[index] = {
          ...this.data.products[index],
          ...updates
        };
        this.save();
        return this.data.products[index];
      }
      return undefined;
    },
    delete: (id: string): boolean => {
      this.initialize();
      const lengthBefore = this.data.products.length;
      this.data.products = this.data.products.filter(p => p.id !== id);
      const deleted = this.data.products.length < lengthBefore;
      if (deleted) {
        this.save();
      }
      return deleted;
    }
  };

  // --- Wishlist Table ---
  public wishlists = {
    find: (filter?: (w: Wishlist) => boolean): Wishlist[] => {
      this.initialize();
      if (filter) {
        return this.data.wishlists.filter(filter);
      }
      return this.data.wishlists;
    },
    findOne: (predicate: (w: Wishlist) => boolean): Wishlist | undefined => {
      this.initialize();
      return this.data.wishlists.find(predicate);
    },
    insert: (wishlist: Omit<Wishlist, "id" | "addedAt">): Wishlist => {
      this.initialize();
      const newWish: Wishlist = {
        ...wishlist,
        id: "w_" + Math.random().toString(36).substr(2, 9),
        addedAt: new Date().toISOString()
      };
      this.data.wishlists.push(newWish);
      this.save();
      return newWish;
    },
    delete: (id: string): boolean => {
      this.initialize();
      const lengthBefore = this.data.wishlists.length;
      this.data.wishlists = this.data.wishlists.filter(w => w.id !== id);
      const deleted = this.data.wishlists.length < lengthBefore;
      if (deleted) {
        this.save();
      }
      return deleted;
    },
    deleteByProduct: (userId: string, productId: string): boolean => {
      this.initialize();
      const lengthBefore = this.data.wishlists.length;
      this.data.wishlists = this.data.wishlists.filter(w => !(w.userId === userId && w.productId === productId));
      const deleted = this.data.wishlists.length < lengthBefore;
      if (deleted) {
        this.save();
      }
      return deleted;
    }
  };

  // --- Cart Table ---
  public carts = {
    find: (filter?: (c: CartItem) => boolean): CartItem[] => {
      this.initialize();
      if (filter) {
        return this.data.carts.filter(filter);
      }
      return this.data.carts;
    },
    findOne: (predicate: (c: CartItem) => boolean): CartItem | undefined => {
      this.initialize();
      return this.data.carts.find(predicate);
    },
    insert: (cart: Omit<CartItem, "id">): CartItem => {
      this.initialize();
      const newItem: CartItem = {
        ...cart,
        id: "c_" + Math.random().toString(36).substr(2, 9)
      };
      this.data.carts.push(newItem);
      this.save();
      return newItem;
    },
    update: (id: string, quantity: number): CartItem | undefined => {
      this.initialize();
      const index = this.data.carts.findIndex(c => c.id === id);
      if (index !== -1) {
        this.data.carts[index].quantity = quantity;
        this.save();
        return this.data.carts[index];
      }
      return undefined;
    },
    delete: (id: string): boolean => {
      this.initialize();
      const lengthBefore = this.data.carts.length;
      this.data.carts = this.data.carts.filter(c => c.id !== id);
      const deleted = this.data.carts.length < lengthBefore;
      if (deleted) {
        this.save();
      }
      return deleted;
    },
    clear: (userId: string) => {
      this.initialize();
      this.data.carts = this.data.carts.filter(c => c.userId !== userId);
      this.save();
    }
  };
}

export const db = new LocalDatabase();
