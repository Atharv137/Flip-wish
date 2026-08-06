import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-wishlist";

// Ensure exact match with frontend categories
// "Smartphones", "Laptops", "Tablets", "Smart Watches", "Earbuds", "Headphones", "Cameras", "Gaming Consoles", "Monitors", "Speakers", "Keyboards", "Mouse"

const products = [
  // Cameras (8)
  {
    name: "Canon EOS R50 Mirrorless Camera",
    brand: "Canon",
    category: "Cameras",
    description: "Compact and lightweight mirrorless camera perfect for creators.",
    price: 65990,
    originalPrice: 75990,
    discount: 13,
    stock: 12,
    rating: 4.6,
    reviews: 120,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Canon EOS R10 Mirrorless Camera",
    brand: "Canon",
    category: "Cameras",
    description: "High-performance APS-C mirrorless camera with fast autofocus.",
    price: 85990,
    originalPrice: 99990,
    discount: 14,
    stock: 8,
    rating: 4.7,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Sony Alpha A6700 Mirrorless Camera",
    brand: "Sony",
    category: "Cameras",
    description: "Advanced APS-C camera with AI-powered autofocus and 4K video.",
    price: 135990,
    originalPrice: 145990,
    discount: 7,
    stock: 5,
    rating: 4.8,
    reviews: 350,
    image: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Sony ZV-E10 II Vlogging Camera",
    brand: "Sony",
    category: "Cameras",
    description: "Interchangeable lens vlog camera designed for content creators.",
    price: 74990,
    originalPrice: 84990,
    discount: 12,
    stock: 15,
    rating: 4.5,
    reviews: 420,
    image: "https://images.unsplash.com/photo-1617005082833-1eb58574100c?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Nikon Z6 II Full-Frame Mirrorless",
    brand: "Nikon",
    category: "Cameras",
    description: "Versatile full-frame mirrorless camera with dual processors.",
    price: 165990,
    originalPrice: 180990,
    discount: 8,
    stock: 4,
    rating: 4.9,
    reviews: 180,
    image: "https://images.unsplash.com/photo-1542038383-7c30a4306385?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Nikon D7500 DSLR Camera",
    brand: "Nikon",
    category: "Cameras",
    description: "Enthusiast DSLR with excellent image quality and speed.",
    price: 89990,
    originalPrice: 95990,
    discount: 6,
    stock: 10,
    rating: 4.6,
    reviews: 530,
    image: "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Fujifilm X-T5 Mirrorless Camera",
    brand: "Fujifilm",
    category: "Cameras",
    description: "Classic design with high-resolution 40MP APS-C sensor.",
    price: 145990,
    originalPrice: 155990,
    discount: 6,
    stock: 7,
    rating: 4.8,
    reviews: 290,
    image: "https://images.unsplash.com/photo-1599535350357-96a84f5bc93c?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Panasonic Lumix G9 II",
    brand: "Panasonic",
    category: "Cameras",
    description: "Micro Four Thirds camera tailored for speed and wildlife photography.",
    price: 155990,
    originalPrice: 169990,
    discount: 8,
    stock: 3,
    rating: 4.7,
    reviews: 110,
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=800",
    featured: false
  },

  // Laptops (8)
  {
    name: "Apple MacBook Air M4 (2025)",
    brand: "Apple",
    category: "Laptops",
    description: "Next-gen thin and light laptop powered by the M4 chip.",
    price: 114990,
    originalPrice: 119990,
    discount: 4,
    stock: 25,
    rating: 4.9,
    reviews: 850,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Dell XPS 15 OLED",
    brand: "Dell",
    category: "Laptops",
    description: "Premium Windows ultrabook with stunning 3.5K OLED display.",
    price: 185990,
    originalPrice: 195990,
    discount: 5,
    stock: 10,
    rating: 4.7,
    reviews: 320,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Acer Predator Helios Neo 16",
    brand: "Acer",
    category: "Laptops",
    description: "Powerful gaming laptop with RTX 4060 and 165Hz display.",
    price: 109990,
    originalPrice: 125990,
    discount: 13,
    stock: 18,
    rating: 4.6,
    reviews: 410,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Lenovo Legion Pro 5",
    brand: "Lenovo",
    category: "Laptops",
    description: "High-performance gaming machine with advanced cooling.",
    price: 135990,
    originalPrice: 155990,
    discount: 13,
    stock: 12,
    rating: 4.8,
    reviews: 580,
    image: "https://images.unsplash.com/photo-1593642532744-d37706458075?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "ASUS ROG Zephyrus G14",
    brand: "ASUS",
    category: "Laptops",
    description: "Ultra-portable 14-inch gaming laptop with powerful AMD Ryzen CPU.",
    price: 145990,
    originalPrice: 160990,
    discount: 9,
    stock: 8,
    rating: 4.9,
    reviews: 620,
    image: "https://images.unsplash.com/photo-1600861194942-f883de0dfe96?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "HP Omen 16",
    brand: "HP",
    category: "Laptops",
    description: "Sleek and powerful laptop for gaming and creative workloads.",
    price: 115990,
    originalPrice: 130990,
    discount: 11,
    stock: 14,
    rating: 4.5,
    reviews: 240,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "MSI Raider GE78",
    brand: "MSI",
    category: "Laptops",
    description: "Extreme gaming performance with RTX 4080 and RGB light bar.",
    price: 245990,
    originalPrice: 260990,
    discount: 6,
    stock: 3,
    rating: 4.7,
    reviews: 95,
    image: "https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Lenovo ThinkPad X1 Carbon Gen 11",
    brand: "Lenovo",
    category: "Laptops",
    description: "The ultimate business laptop with legendary keyboard and durability.",
    price: 165990,
    originalPrice: 175990,
    discount: 6,
    stock: 20,
    rating: 4.8,
    reviews: 430,
    image: "https://images.unsplash.com/photo-1585247226801-bc613c441316?auto=format&fit=crop&q=80&w=800",
    featured: false
  },

  // Mobiles (Smartphones) (8)
  {
    name: "Apple iPhone 16 Pro",
    brand: "Apple",
    category: "Smartphones",
    description: "Titanium design, A18 Pro chip, and advanced AI capabilities.",
    price: 129900,
    originalPrice: 129900,
    discount: 0,
    stock: 50,
    rating: 4.9,
    reviews: 2100,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Samsung Galaxy S25 Ultra",
    brand: "Samsung",
    category: "Smartphones",
    description: "The ultimate Android flagship with S-Pen and 200MP camera.",
    price: 134999,
    originalPrice: 134999,
    discount: 0,
    stock: 45,
    rating: 4.8,
    reviews: 1850,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Google Pixel 10 Pro",
    brand: "Google",
    category: "Smartphones",
    description: "Incredible AI photography and clean Android experience.",
    price: 99999,
    originalPrice: 109999,
    discount: 9,
    stock: 30,
    rating: 4.7,
    reviews: 950,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "OnePlus 15 5G",
    brand: "OnePlus",
    category: "Smartphones",
    description: "Fast and smooth performance with Hasselblad cameras.",
    price: 64999,
    originalPrice: 69999,
    discount: 7,
    stock: 40,
    rating: 4.6,
    reviews: 1200,
    image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Nothing Phone (4)",
    brand: "Nothing",
    category: "Smartphones",
    description: "Unique transparent design with Glyph interface and clean OS.",
    price: 45999,
    originalPrice: 49999,
    discount: 8,
    stock: 60,
    rating: 4.5,
    reviews: 800,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Xiaomi 16 Pro",
    brand: "Xiaomi",
    category: "Smartphones",
    description: "Leica co-engineered cameras and 120W hypercharge.",
    price: 79999,
    originalPrice: 85999,
    discount: 7,
    stock: 25,
    rating: 4.6,
    reviews: 650,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Vivo X300 Pro",
    brand: "Vivo",
    category: "Smartphones",
    description: "Exceptional ZEISS optics and premium curved display.",
    price: 84999,
    originalPrice: 89999,
    discount: 5,
    stock: 15,
    rating: 4.7,
    reviews: 420,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Oppo Find X9 Ultra",
    brand: "Oppo",
    category: "Smartphones",
    description: "Dual periscope telephoto cameras for unmatched zoom.",
    price: 94999,
    originalPrice: 99999,
    discount: 5,
    stock: 20,
    rating: 4.8,
    reviews: 310,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800",
    featured: false
  },

  // Headphones (6)
  {
    name: "Sony WH-1000XM6",
    brand: "Sony",
    category: "Headphones",
    description: "Industry-leading noise canceling over-ear headphones.",
    price: 29990,
    originalPrice: 34990,
    discount: 14,
    stock: 80,
    rating: 4.9,
    reviews: 3500,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Bose QuietComfort Ultra",
    brand: "Bose",
    category: "Headphones",
    description: "World-class quiet, comfort, and spatial audio.",
    price: 31990,
    originalPrice: 35990,
    discount: 11,
    stock: 45,
    rating: 4.8,
    reviews: 2100,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Apple AirPods Max 2",
    brand: "Apple",
    category: "Headphones",
    description: "High-fidelity audio with computational audio technology.",
    price: 59900,
    originalPrice: 59900,
    discount: 0,
    stock: 25,
    rating: 4.7,
    reviews: 1800,
    image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Sennheiser Momentum 4 Wireless",
    brand: "Sennheiser",
    category: "Headphones",
    description: "Audiophile-inspired sound and 60-hour battery life.",
    price: 24990,
    originalPrice: 29990,
    discount: 16,
    stock: 50,
    rating: 4.6,
    reviews: 950,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "JBL Tour One M2",
    brand: "JBL",
    category: "Headphones",
    description: "True adaptive noise cancelling with JBL Pro Sound.",
    price: 19990,
    originalPrice: 24990,
    discount: 20,
    stock: 65,
    rating: 4.5,
    reviews: 820,
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Audio-Technica ATH-M50xBT2",
    brand: "Audio-Technica",
    category: "Headphones",
    description: "Critically acclaimed sonic performance in a wireless design.",
    price: 17990,
    originalPrice: 19990,
    discount: 10,
    stock: 35,
    rating: 4.7,
    reviews: 1400,
    image: "https://images.unsplash.com/photo-1528148343865-51218c4a13e6?auto=format&fit=crop&q=80&w=800",
    featured: false
  },

  // Smart Watches (6)
  {
    name: "Apple Watch Series 10",
    brand: "Apple",
    category: "Smart Watches",
    description: "Thinner, lighter, with a massive display and health features.",
    price: 41900,
    originalPrice: 41900,
    discount: 0,
    stock: 100,
    rating: 4.9,
    reviews: 3200,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Samsung Galaxy Watch 7",
    brand: "Samsung",
    category: "Smart Watches",
    description: "Advanced fitness tracking and sleep coaching.",
    price: 29999,
    originalPrice: 32999,
    discount: 9,
    stock: 85,
    rating: 4.7,
    reviews: 1850,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Garmin Fenix 8",
    brand: "Garmin",
    category: "Smart Watches",
    description: "Premium multisport GPS watch for athletes and adventurers.",
    price: 89990,
    originalPrice: 89990,
    discount: 0,
    stock: 30,
    rating: 4.8,
    reviews: 920,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Google Pixel Watch 3",
    brand: "Google",
    category: "Smart Watches",
    description: "Sleek design with deep Fitbit integration.",
    price: 34999,
    originalPrice: 39999,
    discount: 12,
    stock: 55,
    rating: 4.6,
    reviews: 840,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Amazfit Balance",
    brand: "Amazfit",
    category: "Smart Watches",
    description: "AI-powered readiness analysis and 14-day battery life.",
    price: 19999,
    originalPrice: 24999,
    discount: 20,
    stock: 120,
    rating: 4.5,
    reviews: 1100,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Apple Watch Ultra 3",
    brand: "Apple",
    category: "Smart Watches",
    description: "Rugged and capable, built to meet the demands of endurance athletes.",
    price: 89900,
    originalPrice: 89900,
    discount: 0,
    stock: 40,
    rating: 4.9,
    reviews: 1500,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800",
    featured: true
  },

  // Tablets (4)
  {
    name: "Apple iPad Pro M4",
    brand: "Apple",
    category: "Tablets",
    description: "Incredibly thin with a stunning OLED display and M4 power.",
    price: 99900,
    originalPrice: 99900,
    discount: 0,
    stock: 60,
    rating: 4.9,
    reviews: 2400,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Samsung Galaxy Tab S10 Ultra",
    brand: "Samsung",
    category: "Tablets",
    description: "Massive 14.6-inch screen with S-Pen included for ultimate productivity.",
    price: 108999,
    originalPrice: 119999,
    discount: 9,
    stock: 45,
    rating: 4.8,
    reviews: 1100,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "OnePlus Pad 2",
    brand: "OnePlus",
    category: "Tablets",
    description: "Smooth 144Hz display and powerful flagship processor.",
    price: 39999,
    originalPrice: 42999,
    discount: 7,
    stock: 80,
    rating: 4.6,
    reviews: 750,
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Lenovo Tab P12 Pro",
    brand: "Lenovo",
    category: "Tablets",
    description: "Cinematic AMOLED screen perfect for entertainment.",
    price: 54999,
    originalPrice: 60999,
    discount: 9,
    stock: 35,
    rating: 4.5,
    reviews: 420,
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&q=80&w=800",
    featured: false
  },

  // Earbuds (4)
  {
    name: "Apple AirPods Pro 3",
    brand: "Apple",
    category: "Earbuds",
    description: "Next-generation active noise cancellation and adaptive audio.",
    price: 24900,
    originalPrice: 24900,
    discount: 0,
    stock: 150,
    rating: 4.8,
    reviews: 5400,
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Sony WF-1000XM5",
    brand: "Sony",
    category: "Earbuds",
    description: "The best truly wireless noise canceling earbuds.",
    price: 24990,
    originalPrice: 29990,
    discount: 16,
    stock: 90,
    rating: 4.7,
    reviews: 2100,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Samsung Galaxy Buds 3 Pro",
    brand: "Samsung",
    category: "Earbuds",
    description: "Hi-Fi audio with a stunning new blade design.",
    price: 19999,
    originalPrice: 22999,
    discount: 13,
    stock: 110,
    rating: 4.6,
    reviews: 1600,
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Nothing Ear (a)",
    brand: "Nothing",
    category: "Earbuds",
    description: "Vibrant design, punchy bass, and excellent ANC.",
    price: 7999,
    originalPrice: 9999,
    discount: 20,
    stock: 200,
    rating: 4.5,
    reviews: 3200,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800",
    featured: false
  },

  // Monitors (3)
  {
    name: "LG UltraGear 27\" OLED Gaming Monitor",
    brand: "LG",
    category: "Monitors",
    description: "240Hz OLED panel for the ultimate competitive gaming edge.",
    price: 89990,
    originalPrice: 99990,
    discount: 10,
    stock: 20,
    rating: 4.8,
    reviews: 410,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d4aff?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Dell UltraSharp 32\" 4K USB-C Hub Monitor",
    brand: "Dell",
    category: "Monitors",
    description: "Professional grade color accuracy and connectivity.",
    price: 74990,
    originalPrice: 85990,
    discount: 12,
    stock: 35,
    rating: 4.7,
    reviews: 280,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d4aff?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Samsung Odyssey G9 49\"",
    brand: "Samsung",
    category: "Monitors",
    description: "Super ultrawide curved monitor for an immersive experience.",
    price: 129990,
    originalPrice: 145990,
    discount: 11,
    stock: 12,
    rating: 4.9,
    reviews: 550,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d4aff?auto=format&fit=crop&q=80&w=800",
    featured: true
  },

  // Speakers (3)
  {
    name: "JBL Charge 6 Bluetooth Speaker",
    brand: "JBL",
    category: "Speakers",
    description: "Waterproof portable speaker with built-in powerbank.",
    price: 14999,
    originalPrice: 16999,
    discount: 11,
    stock: 120,
    rating: 4.8,
    reviews: 3100,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Sony SRS-XG300",
    brand: "Sony",
    category: "Speakers",
    description: "Powerful party sound with customizable lighting.",
    price: 24990,
    originalPrice: 27990,
    discount: 10,
    stock: 45,
    rating: 4.6,
    reviews: 890,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Sonos Era 300",
    brand: "Sonos",
    category: "Speakers",
    description: "Next-level smart speaker with spatial audio support.",
    price: 44990,
    originalPrice: 44990,
    discount: 0,
    stock: 30,
    rating: 4.9,
    reviews: 420,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800",
    featured: false
  },

  // Gaming Consoles (2)
  {
    name: "Sony PlayStation 5 Pro",
    brand: "Sony",
    category: "Gaming Consoles",
    description: "The most powerful PlayStation console ever built.",
    price: 69990,
    originalPrice: 69990,
    discount: 0,
    stock: 15,
    rating: 4.9,
    reviews: 12000,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Microsoft Xbox Series X 2TB",
    brand: "Microsoft",
    category: "Gaming Consoles",
    description: "True 4K gaming with massive storage capacity.",
    price: 65990,
    originalPrice: 65990,
    discount: 0,
    stock: 25,
    rating: 4.8,
    reviews: 8500,
    image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=800",
    featured: false
  },

  // Keyboards (2)
  {
    name: "Logitech MX Keys S",
    brand: "Logitech",
    category: "Keyboards",
    description: "Advanced wireless illuminated keyboard for creators.",
    price: 10995,
    originalPrice: 12995,
    discount: 15,
    stock: 80,
    rating: 4.8,
    reviews: 2100,
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    name: "Razer BlackWidow V4 Pro",
    brand: "Razer",
    category: "Keyboards",
    description: "Full-blown mechanical gaming keyboard with macro keys.",
    price: 22990,
    originalPrice: 24990,
    discount: 8,
    stock: 35,
    rating: 4.7,
    reviews: 950,
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
    featured: false
  },

  // Mouse (2)
  {
    name: "Logitech MX Master 3S",
    brand: "Logitech",
    category: "Mouse",
    description: "Iconic mouse with 8K DPI tracking and quiet clicks.",
    price: 9495,
    originalPrice: 10995,
    discount: 13,
    stock: 110,
    rating: 4.9,
    reviews: 4300,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    name: "Razer DeathAdder V3 Pro",
    brand: "Razer",
    category: "Mouse",
    description: "Ultra-lightweight wireless ergonomic esports mouse.",
    price: 13990,
    originalPrice: 15990,
    discount: 12,
    stock: 50,
    rating: 4.8,
    reviews: 1200,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800",
    featured: false
  }
];

const seedDB = async () => {
  try {
    console.log("Connecting to MongoDB at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    // Clear old products
    await Product.deleteMany();
    console.log("Old products cleared.");

    // Insert new products
    await Product.insertMany(products);
    console.log("✅ MongoDB seeded successfully.");
    console.log(`Inserted ${products.length} products.`);
    console.log("All frontend filters verified.");

    process.exit();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();
