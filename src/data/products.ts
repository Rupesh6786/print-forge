export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  image: string;
  category: string;
  materials: ("PLA" | "ABS" | "Resin")[];
  stock: number;
  rating: number;
  description: string;
}

export const products: Product[] = [
  { id: "p1", name: "Voronoi Lamp Shade", tagline: "Algorithmic lighting sculpture", price: 89, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", category: "Home", materials: ["PLA","Resin"], stock: 24, rating: 4.8, description: "A parametric voronoi lamp generated from a fractal seed. Cast cathedral-like patterns on any wall." },
  { id: "p2", name: "Articulated Dragon", tagline: "Print-in-place flex toy", price: 34, image: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&q=80", category: "Toys", materials: ["PLA","ABS"], stock: 58, rating: 4.9, description: "Fully articulated, no assembly. Snake-like spine with 24 segments. The viral sensation of print farms." },
  { id: "p3", name: "Hex Planter Pro", tagline: "Modular geometric vessel", price: 24, image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80", category: "Home", materials: ["PLA","ABS"], stock: 120, rating: 4.7, description: "Stackable hex planters with integrated drainage. Build your own vertical garden." },
  { id: "p4", name: "Mechanical Phone Stand", tagline: "Industrial desk piece", price: 42, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80", category: "Office", materials: ["ABS","Resin"], stock: 36, rating: 4.6, description: "Brutalist phone stand with cable routing. Engineered for both portrait and landscape." },
  { id: "p5", name: "Lithophane Frame", tagline: "Photo-to-light conversion", price: 55, image: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80", category: "Custom", materials: ["PLA"], stock: 18, rating: 5.0, description: "Upload a photo, we print a backlit lithophane. Heirloom-quality keepsake." },
  { id: "p6", name: "Drone Frame X4", tagline: "Carbon-loaded racing chassis", price: 129, image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80", category: "Tech", materials: ["ABS"], stock: 12, rating: 4.9, description: "5-inch racing drone frame, carbon-fiber-loaded nylon. Tested to 120kph impacts." },
  { id: "p7", name: "Topographic Coaster Set", tagline: "Mountain-inspired drinkware", price: 28, image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800&q=80", category: "Home", materials: ["Resin"], stock: 80, rating: 4.7, description: "Set of 4 resin coasters featuring iconic mountain topographies." },
  { id: "p8", name: "Cyberpunk Helmet Kit", tagline: "Wearable cosplay shell", price: 219, image: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&q=80", category: "Cosplay", materials: ["PLA","ABS"], stock: 6, rating: 4.8, description: "Multi-part helmet kit with LED channels. Snap-fit assembly, paintable surface." },
];

export const featured = products.slice(0, 4);
