export interface Product {
  id: number;
  name: string;
  description: string;
  priceOriginal: number;
  priceSale: number;
  images: string[];
  stock: number;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Milan Tortoise Shell",
    description: "Classic tortoise shell frames with premium acetate construction. Lightweight and durable design perfect for everyday wear.",
    priceOriginal: 249,
    priceSale: 99,
    images: [
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80"
    ],
    stock: 2
  },
  {
    id: 2,
    name: "Brooklyn Round Metal",
    description: "Vintage-inspired round metal frames with adjustable nose pads. Perfect blend of style and comfort for the modern individual.",
    priceOriginal: 299,
    priceSale: 129,
    images: [
      "https://images.unsplash.com/photo-1475669698648-2f144fcaaeb1?w=800&q=80",
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80",
      "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80"
    ],
    stock: 8
  },
  {
    id: 3,
    name: "Monaco Blue Aviator",
    description: "Premium titanium aviator frames with blue-tinted lenses. UV400 protection and anti-glare coating included.",
    priceOriginal: 349,
    priceSale: 149,
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
      "https://images.unsplash.com/photo-1502767089025-6572583495f9?w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80"
    ],
    stock: 12
  },
  {
    id: 4,
    name: "Tokyo Clear Acetate",
    description: "Minimalist clear acetate frames with subtle details. Lightweight design that complements any outfit effortlessly.",
    priceOriginal: 199,
    priceSale: 79,
    images: [
      "https://images.unsplash.com/photo-1615485737077-7f73e36f7f68?w=800&q=80",
      "https://images.unsplash.com/photo-1524438418049-ab2acb7aa48c?w=800&q=80",
      "https://images.unsplash.com/photo-1606497547160-ebf0cbf48c81?w=800&q=80"
    ],
    stock: 1
  },
  {
    id: 5,
    name: "Paris Oversized Square",
    description: "Bold oversized square frames for a statement look. High-quality acetate with spring hinges for comfort.",
    priceOriginal: 279,
    priceSale: 119,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800&q=80",
      "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&q=80"
    ],
    stock: 15
  },
  {
    id: 6,
    name: "Berlin Slim Wire",
    description: "Ultra-slim wire frames with minimalist design. Featherweight construction for all-day comfort.",
    priceOriginal: 229,
    priceSale: 89,
    images: [
      "https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=800&q=80",
      "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80",
      "https://images.unsplash.com/photo-1516134133086-e1e208b63176?w=800&q=80"
    ],
    stock: 4
  },
  {
    id: 7,
    name: "London Cat Eye Vintage",
    description: "Retro cat-eye frames with a modern twist. Premium acetate in rich colors with metal accents.",
    priceOriginal: 259,
    priceSale: 109,
    images: [
      "https://images.unsplash.com/photo-1606497547160-ebf0cbf48c81?w=800&q=80",
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80"
    ],
    stock: 3
  },
  {
    id: 8,
    name: "Sydney Sport Flex",
    description: "Flexible sport frames with rubber grips. Perfect for active lifestyles with impact-resistant lenses.",
    priceOriginal: 289,
    priceSale: 139,
    images: [
      "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80",
      "https://images.unsplash.com/photo-1603366445787-09714680cbf1?w=800&q=80",
      "https://images.unsplash.com/photo-1594296172827-8d6f28f5ccb3?w=800&q=80"
    ],
    stock: 20
  }
];
