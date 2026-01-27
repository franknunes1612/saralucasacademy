import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ExternalLink, Star } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: string;
  rating: number;
  imageEmoji: string;
  affiliateUrl: string;
  isFavorite?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Organic Protein Powder",
    brand: "NutriPure",
    category: "Supplements",
    description: "Plant-based protein with 25g per serving. No artificial sweeteners.",
    price: "€34.99",
    rating: 4.8,
    imageEmoji: "🥛",
    affiliateUrl: "https://www.amazon.com/s?k=organic+plant+protein+powder"
  },
  {
    id: "2",
    name: "Digital Food Scale",
    brand: "FitTrack",
    category: "Kitchen",
    description: "Precise 0.1g accuracy with nutritional database integration.",
    price: "€29.99",
    rating: 4.6,
    imageEmoji: "⚖️",
    affiliateUrl: "https://www.amazon.com/s?k=digital+food+scale"
  },
  {
    id: "3",
    name: "Meal Prep Containers",
    brand: "GlassLock",
    category: "Kitchen",
    description: "BPA-free glass containers with portion control dividers. Set of 10.",
    price: "€24.99",
    rating: 4.7,
    imageEmoji: "📦",
    affiliateUrl: "https://www.amazon.com/s?k=glass+meal+prep+containers"
  },
  {
    id: "4",
    name: "Resistance Bands Set",
    brand: "FlexFit",
    category: "Fitness",
    description: "5 resistance levels for home workouts. Includes door anchor.",
    price: "€19.99",
    rating: 4.5,
    imageEmoji: "🏋️",
    affiliateUrl: "https://www.amazon.com/s?k=resistance+bands+set"
  },
  {
    id: "5",
    name: "Greek Yogurt Maker",
    brand: "CulturePro",
    category: "Kitchen",
    description: "Make fresh, high-protein yogurt at home. 1L capacity.",
    price: "€39.99",
    rating: 4.4,
    imageEmoji: "🥣",
    affiliateUrl: "https://www.amazon.com/s?k=greek+yogurt+maker"
  },
  {
    id: "6",
    name: "Omega-3 Fish Oil",
    brand: "PureOcean",
    category: "Supplements",
    description: "High-potency EPA/DHA from wild-caught fish. 120 softgels.",
    price: "€22.99",
    rating: 4.9,
    imageEmoji: "🐟",
    affiliateUrl: "https://www.amazon.com/s?k=omega+3+fish+oil"
  }
];

function ProductCard({ 
  product, 
  onToggleFavorite 
}: { 
  product: Product; 
  onToggleFavorite: (id: string) => void;
}) {
  const handleBuy = () => {
    window.open(product.affiliateUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="result-card p-4">
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
          {product.imageEmoji}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate">{product.name}</h3>
              <p className="text-xs text-white/50">{product.brand}</p>
            </div>
            <button
              onClick={() => onToggleFavorite(product.id)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={product.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={`h-4 w-4 ${product.isFavorite ? "fill-destructive text-destructive" : "text-white/40"}`} 
              />
            </button>
          </div>
          
          <p className="text-xs text-white/70 line-clamp-2 mb-2">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{product.price}</span>
              <div className="flex items-center gap-0.5 text-warning">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-xs">{product.rating}</span>
              </div>
            </div>
            <button
              onClick={handleBuy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              View
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const toggleFavorite = (id: string) => {
    setProducts(prev => 
      prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
    );
  };

  const displayProducts = showFavoritesOnly 
    ? products.filter(p => p.isFavorite) 
    : products;

  const favoriteCount = products.filter(p => p.isFavorite).length;

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Recommended Products</h1>
          <p className="text-xs text-white/60">Curated by nutritionists</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setShowFavoritesOnly(false)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !showFavoritesOnly 
              ? "bg-primary text-primary-foreground" 
              : "bg-white/10 text-white/80 hover:bg-white/20"
          }`}
        >
          All Products
        </button>
        <button
          onClick={() => setShowFavoritesOnly(true)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            showFavoritesOnly 
              ? "bg-primary text-primary-foreground" 
              : "bg-white/10 text-white/80 hover:bg-white/20"
          }`}
        >
          <Heart className="h-3.5 w-3.5" />
          Favorites {favoriteCount > 0 && `(${favoriteCount})`}
        </button>
      </div>

      {/* Products list */}
      <div className="space-y-3">
        {displayProducts.length > 0 ? (
          displayProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onToggleFavorite={toggleFavorite}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">No favorites yet</p>
            <p className="text-xs text-white/40 mt-1">Tap the heart icon to save products</p>
          </div>
        )}
      </div>

      {/* Affiliate disclaimer */}
      <div className="mt-6 p-3 rounded-xl bg-white/5">
        <p className="text-[10px] text-white/40 text-center">
          Some links are affiliate links. We may earn a small commission at no extra cost to you.
        </p>
      </div>
    </div>
  );
}
