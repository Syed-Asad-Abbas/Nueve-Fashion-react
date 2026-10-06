export const asset = (name) => `/assets/${name}`;
export const money = (amount) => `$${amount.toFixed(2)}`;
export const products = [
  {
    id: "linen-shorts",
    name: "Linen Blend Bermuda Shorts",
    price: 40,
    image: "product-linen-shorts.webp",
    category: "Men",
    tags: ["Best Selling", "Summer"],
    colors: ["Sand", "Black"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "linen-court",
    name: "Linen Blend Bermuda court",
    price: 35,
    image: "product-linen-court.webp",
    category: "Men",
    tags: ["New Arrival", "Summer"],
    colors: ["Chocolate", "Black"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "girls-court",
    name: "Girls Court Top Blend",
    price: 50,
    image: "product-girls-court.webp",
    gallery: [
      "product-girls-court.webp",
      "product-girls-detail.webp",
      "product-girls-detail-2.webp",
      "product-girls-detail-back.webp",
    ],
    category: "Women",
    tags: ["Best Selling", "New Arrival"],
    colors: ["Ivory", "Sand"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "amber-shirt",
    name: "Amber Blend Bermuda T Shirt",
    price: 56,
    image: "product-amber-shirt.webp",
    category: "Men",
    tags: ["Best Selling"],
    colors: ["Black", "Navy"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "girls-bter",
    name: "Girls Court Top Blend Bter",
    price: 70,
    image: "product-girls-bter.webp",
    category: "Women",
    tags: ["New Arrival"],
    colors: ["Camel", "Ivory"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "sweat-shirt",
    name: "Sweat T Shirt with T Shirt",
    price: 80,
    image: "product-sweat-shirt.webp",
    category: "Men",
    tags: ["New Arrival"],
    colors: ["Charcoal", "Black"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "cotton-mesh",
    name: "Cotton Mesh Shirt",
    price: 400,
    compare: 600,
    image: "collection-cotton.webp",
    category: "Men",
    tags: ["Best Selling", "Summer"],
    colors: ["Navy", "White"],
    sizes: ["S", "M", "L", "XL"],
    showcase: true,
  },
  {
    id: "navy-mesh",
    name: "Navy Mesh Shirt",
    price: 400,
    compare: 600,
    image: "collection-navy.webp",
    category: "Men",
    tags: ["New Arrival", "Summer"],
    colors: ["Navy", "White"],
    sizes: ["S", "M", "L", "XL"],
    showcase: true,
  },
  {
    id: "sky-mesh",
    name: "Sky Blue Mesh Shirt",
    price: 400,
    compare: 600,
    image: "collection-sky.webp",
    category: "Men",
    tags: ["Best Selling", "Summer"],
    colors: ["Sky Blue", "White"],
    sizes: ["S", "M", "L", "XL"],
    showcase: true,
  },
  {
    id: "kimono-coat",
    name: "Kimono Abaya Coat",
    price: 450,
    compare: 600,
    image: "product-girls-detail.webp",
    gallery: [
      "product-girls-detail.webp",
      "product-girls-detail-2.webp",
      "product-girls-detail-back.webp",
      "product-girls-detail-3.webp",
    ],
    category: "Women",
    tags: ["Best Selling", "New Arrival"],
    colors: ["Camel", "Grey", "Ivory"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    detail: true,
  },
  {
    id: "chain-bag",
    name: "Minimal Chain Shoulder Bag",
    price: 95,
    compare: 120,
    image: "category-bag.webp",
    category: "Accessories",
    tags: ["Best Selling", "Summer"],
    colors: ["Beige", "Black"],
    sizes: ["One Size"],
    showcase: true,
  },
  {
    id: "color-bag",
    name: "Modern Color Leather Bag",
    price: 120,
    image: "bags-color.webp",
    category: "Accessories",
    tags: ["New Arrival", "Summer"],
    colors: ["Blue", "Yellow"],
    sizes: ["One Size"],
    showcase: true,
  },
  {
    id: "beauty-bag",
    name: "Classic Leather Shoulder Bag",
    price: 110,
    image: "bags-beauty.webp",
    category: "Accessories",
    tags: ["Best Selling"],
    colors: ["Ivory", "Blue"],
    sizes: ["One Size"],
    showcase: true,
  },
];
export const collectionTabs = [
  "All",
  "Best Selling",
  "New Arrival",
  "Accessories",
  "Summer",
];
export const audienceTabs = [
  "All Collection",
  "Men Collection",
  "Women Collection",
];
export function filterProducts(list, filter = "All") {
  if (["All", "All Collection"].includes(filter)) return list;
  if (filter === "Sale") return list.filter((p) => p.compare > p.price);
  const category = filter.replace(" Collection", "");
  return list.filter((p) => p.category === category || p.tags.includes(filter));
}
export function calculateTotals(items, coupon = "") {
  const unitPrices = items
    .flatMap((item) =>
      Array(item.quantity).fill(products.find((p) => p.id === item.id).price),
    )
    .sort((a, b) => a - b);
  const subtotal = unitPrices.reduce((sum, price) => sum + price, 0);
  const promotion = unitPrices
    .slice(0, Math.floor(unitPrices.length / 4))
    .reduce((sum, price) => sum + price, 0);
  const discount =
    coupon === "NUEVE10" ? Math.round((subtotal - promotion) * 10) / 100 : 0;
  return {
    subtotal,
    promotion,
    discount,
    total: Math.round((subtotal - promotion - discount) * 100) / 100,
  };
}
export const mobileProducts = Array.from({ length: 9 }, (_, i) => ({
  id: `mobile-look-${i + 1}`,
  name: "Linen Blend Bermuda Shorts",
  price: 40,
  image: `mobile-look-${i + 1}.webp`,
  cardImage: `mobile-catalog-card-${i + 1}.webp`,
  category: "Women",
  tags: i % 2 ? ["New Arrival", "Summer"] : ["Best Selling", "Summer"],
  colors: ["Ivory", "Camel"],
  sizes: ["S", "M", "L", "XL"],
  mobileOnly: true,
}));
products.push(...mobileProducts);
