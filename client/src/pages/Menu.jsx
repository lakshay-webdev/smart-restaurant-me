import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronUp, SlidersHorizontal } from "lucide-react";
import { useCart } from "../context/CartContext";
import FoodCard from "../components/FoodCard";
import ProductDetailModal from "../components/ProductDetailModal";
import "./Menu.css";

/* ───────────── Rich Menu Data ───────────── */
const MENU_DATA = [
  // Starters
  { id: 1, name: "Paneer Tikka", description: "Succulent paneer cubes marinated in aromatic tandoori spices, grilled to smoky perfection in clay oven", price: 220, category: "Starters", image: "/paneer-tikka.jpg", isVeg: true, rating: 4.5, bestseller: true },
  { id: 13, name: "Veg Spring Rolls", description: "Crispy golden rolls stuffed with seasoned vegetables, served with sweet chili sauce", price: 180, category: "Starters", image: "/spring-roll.jpg", isVeg: true, rating: 4.2, bestseller: false },
  { id: 25, name: "Mushroom Galawati", description: "Melt-in-mouth mushroom kebabs inspired by Lucknowi royal kitchens", price: 240, category: "Starters", image: "/mushroom-galawati.jpg", isVeg: true, rating: 4.6, bestseller: true },
  { id: 26, name: "Chicken Tikka", description: "Tender chicken pieces marinated in yogurt and spices, char-grilled in tandoor", price: 280, category: "Starters", image: "/chicken-tikka.jpg", isVeg: false, rating: 4.7, bestseller: true },
  { id: 27, name: "Fish Amritsari", description: "Crispy batter-fried fish fillets seasoned with ajwain and chaat masala", price: 320, category: "Starters", image: "/fish-amritsari.jpg", isVeg: false, rating: 4.4, bestseller: false },

  // Main Course
  { id: 2, name: "Paneer Butter Masala", description: "Rich and creamy tomato-based curry with soft paneer cubes, finished with butter and cream", price: 260, category: "Main Course", image: "/paneer-butter-masala.jpg", isVeg: true, rating: 4.7, bestseller: true },
  { id: 3, name: "Dal Makhani", description: "Slow-cooked black lentils in a rich buttery gravy, simmered overnight for deep flavour", price: 240, category: "Main Course", image: "/dal-makhani.jpg", isVeg: true, rating: 4.6, bestseller: true },
  { id: 14, name: "Mix Veg Curry", description: "Fresh seasonal vegetables cooked in aromatic gravy with whole spices", price: 230, category: "Main Course", image: "/mix-veg.jpg", isVeg: true, rating: 4.1, bestseller: false },
  { id: 15, name: "Kadai Paneer", description: "Paneer cubes tossed with capsicum in a spicy kadai masala gravy", price: 270, category: "Main Course", image: "/kadai-paneer.jpg", isVeg: true, rating: 4.4, bestseller: false },
  { id: 28, name: "Butter Chicken", description: "Tender chicken in a luscious tomato-butter gravy, a timeless North Indian classic", price: 300, category: "Main Course", image: "/butter-chicken.jpg", isVeg: false, rating: 4.8, bestseller: true },
  { id: 29, name: "Mutton Rogan Josh", description: "Aromatic Kashmiri-style mutton curry slow-cooked with whole spices", price: 380, category: "Main Course", image: "/mutton-rogan-josh.jpg", isVeg: false, rating: 4.5, bestseller: false },

  // Rice & Biryani
  { id: 4, name: "Veg Biryani", description: "Fragrant basmati rice layered with spiced vegetables and saffron, cooked dum style", price: 250, category: "Rice & Biryani", image: "/veg-biryani.jpg", isVeg: true, rating: 4.3, bestseller: false },
  { id: 7, name: "Plain Rice", description: "Steamed long-grain basmati rice, perfectly fluffy", price: 120, category: "Rice & Biryani", image: "/plain-rice.jpg", isVeg: true, rating: 4.0, bestseller: false },
  { id: 16, name: "Jeera Rice", description: "Aromatic basmati rice tempered with cumin seeds and ghee", price: 160, category: "Rice & Biryani", image: "/jeera-rice.jpg", isVeg: true, rating: 4.2, bestseller: false },
  { id: 30, name: "Chicken Biryani", description: "Royal Hyderabadi-style dum biryani with tender chicken and aromatic spices", price: 320, category: "Rice & Biryani", image: "/chicken-biryani.jpg", isVeg: false, rating: 4.8, bestseller: true },
  { id: 31, name: "Mutton Biryani", description: "Slow-cooked mutton biryani with layered basmati rice and saffron", price: 380, category: "Rice & Biryani", image: "/mutton-biryani.jpg", isVeg: false, rating: 4.7, bestseller: true },

  // Breads
  { id: 8, name: "Butter Naan", description: "Soft leavened bread baked in tandoor, brushed with butter", price: 60, category: "Breads", image: "/butter-naan.jpg", isVeg: true, rating: 4.5, bestseller: true },
  { id: 20, name: "Lachha Paratha", description: "Flaky layered paratha made with whole wheat, crispy and buttery", price: 60, category: "Breads", image: "/lachha-paratha.jpg", isVeg: true, rating: 4.3, bestseller: false },
  { id: 32, name: "Garlic Naan", description: "Tandoor-baked naan topped with garlic, butter and fresh coriander", price: 70, category: "Breads", image: "/garlic-naan.jpg", isVeg: true, rating: 4.6, bestseller: true },
  { id: 33, name: "Tandoori Roti", description: "Traditional whole wheat flatbread baked in clay oven", price: 40, category: "Breads", image: "/tandoori-roti.jpg", isVeg: true, rating: 4.1, bestseller: false },

  // Chinese
  { id: 19, name: "Veg Hakka Noodles", description: "Stir-fried noodles tossed with crunchy vegetables in Indo-Chinese soy sauce", price: 190, category: "Chinese", image: "/hakka-noodles.jpg", isVeg: true, rating: 4.2, bestseller: false },
  { id: 22, name: "Chilli Garlic Noodles", description: "Spicy noodles wok-tossed with garlic, green chillies and soy sauce", price: 220, category: "Chinese", image: "/chilli-noodles.jpg", isVeg: true, rating: 4.3, bestseller: false },
  { id: 34, name: "Veg Manchurian", description: "Crispy vegetable balls in a tangy, spicy Manchurian sauce", price: 200, category: "Chinese", image: "/veg-manchurian.jpg", isVeg: true, rating: 4.1, bestseller: false },
  { id: 35, name: "Chicken Fried Rice", description: "Wok-tossed rice with tender chicken, eggs, and vegetables", price: 240, category: "Chinese", image: "/chicken-fried-rice.jpg", isVeg: false, rating: 4.4, bestseller: false },

  // Fast Food
  { id: 17, name: "Veg Burger", description: "Crispy aloo tikki burger with fresh lettuce, tomato and special sauce", price: 80, category: "Fast Food", image: "/veg-burger.jpg", isVeg: true, rating: 4.0, bestseller: false },
  { id: 23, name: "French Fries", description: "Golden crispy potato fries seasoned with peri-peri masala", price: 100, category: "Fast Food", image: "/fries.jpg", isVeg: true, rating: 4.1, bestseller: false },
  { id: 24, name: "Cheese Burger", description: "Juicy patty loaded with melted cheese, pickles, and house sauce", price: 150, category: "Fast Food", image: "/cheese-burger.jpg", isVeg: false, rating: 4.3, bestseller: false },
  { id: 36, name: "Chicken Wrap", description: "Grilled chicken wrapped in tortilla with veggies and mayo", price: 180, category: "Fast Food", image: "/chicken-wrap.jpg", isVeg: false, rating: 4.2, bestseller: false },

  // Beverages
  { id: 9, name: "Mineral Water", description: "Packaged drinking water 500ml", price: 30, category: "Beverages", image: "/mineral-water.jpg", isVeg: true, rating: 4.0, bestseller: false },
  { id: 10, name: "Cold Coffee", description: "Creamy cold coffee blended with ice cream and chocolate drizzle", price: 120, category: "Beverages", image: "/cold-coffee.jpg", isVeg: true, rating: 4.5, bestseller: true },
  { id: 21, name: "Mango Shake", description: "Fresh Alphonso mango milkshake, thick and creamy", price: 80, category: "Beverages", image: "/mango-shake.jpg", isVeg: true, rating: 4.6, bestseller: true },
  { id: 37, name: "Masala Chai", description: "Traditional Indian spiced tea brewed with cardamom and ginger", price: 40, category: "Beverages", image: "/masala-chai.jpg", isVeg: true, rating: 4.4, bestseller: false },
  { id: 38, name: "Fresh Lime Soda", description: "Refreshing lime soda with mint, sweet or salted", price: 60, category: "Beverages", image: "/lime-soda.jpg", isVeg: true, rating: 4.3, bestseller: false },

  // Desserts
  { id: 5, name: "Chocolate Lava Cake", description: "Warm chocolate cake with a molten chocolate center, served with vanilla ice cream", price: 170, category: "Desserts", image: "/chocolate-lava.jpg", isVeg: true, rating: 4.7, bestseller: true },
  { id: 6, name: "Vanilla Ice Cream", description: "Two scoops of premium vanilla bean ice cream", price: 80, category: "Desserts", image: "/vanilla-ice-cream.jpg", isVeg: true, rating: 4.2, bestseller: false },
  { id: 11, name: "Rasmalai", description: "Soft cottage cheese dumplings soaked in saffron-flavored milk", price: 100, category: "Desserts", image: "/rasmalai.jpg", isVeg: true, rating: 4.5, bestseller: true },
  { id: 12, name: "Brownie with Ice Cream", description: "Warm fudgy brownie topped with vanilla ice cream and chocolate sauce", price: 150, category: "Desserts", image: "/brownie.jpg", isVeg: true, rating: 4.6, bestseller: false },
  { id: 18, name: "Gulab Jamun", description: "Soft milk-solid dumplings soaked in rose-flavored sugar syrup", price: 40, category: "Desserts", image: "/gulab-jamun.jpg", isVeg: true, rating: 4.4, bestseller: false },
];

const CATEGORIES = [
  "Recommended",
  "Starters",
  "Main Course",
  "Rice & Biryani",
  "Breads",
  "Chinese",
  "Fast Food",
  "Beverages",
  "Desserts",
];

/* ───────────── Scroll-to-Top Button ───────────── */
function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-[9996] bg-white/10 backdrop-blur-sm text-white p-3 rounded-full shadow-lg hover:bg-white/20 transition border border-white/10"
    >
      <ChevronUp size={20} />
    </motion.button>
  );
}

/* ───────────── Main Menu Page ───────────── */
export default function Menu() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [activeCategory, setActiveCategory] = useState("Recommended");
  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);

  const categoryRefs = useRef({});
  const categoryBarRef = useRef(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Sync search from URL params
  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // ── Filter logic ──
  const filteredItems = useMemo(() => {
    let items = MENU_DATA;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    if (vegOnly) items = items.filter((i) => i.isVeg);
    if (nonVegOnly) items = items.filter((i) => !i.isVeg);
    items = items.filter((i) => i.price >= priceRange[0] && i.price <= priceRange[1]);

    return items;
  }, [searchQuery, vegOnly, nonVegOnly, priceRange]);

  // ── Group by category ──
  const groupedItems = useMemo(() => {
    const groups = {};
    CATEGORIES.forEach((cat) => {
      if (cat === "Recommended") {
        const rec = filteredItems.filter((i) => i.bestseller || i.rating >= 4.5);
        if (rec.length) groups[cat] = rec;
      } else {
        const catItems = filteredItems.filter((i) => i.category === cat);
        if (catItems.length) groups[cat] = catItems;
      }
    });
    return groups;
  }, [filteredItems]);

  // ── Sort within groups ──
  const sortedGroups = useMemo(() => {
    const sorted = {};
    for (const [cat, items] of Object.entries(groupedItems)) {
      const s = [...items];
      if (sortBy === "price-low") s.sort((a, b) => a.price - b.price);
      else if (sortBy === "price-high") s.sort((a, b) => b.price - a.price);
      else if (sortBy === "rating") s.sort((a, b) => b.rating - a.rating);
      sorted[cat] = s;
    }
    return sorted;
  }, [groupedItems, sortBy]);

  const availableCategories = useMemo(
    () => CATEGORIES.filter((c) => groupedItems[c]?.length > 0),
    [groupedItems]
  );

  // ── Intersection Observer — highlight active category ──
  useEffect(() => {
    if (isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.dataset.category);
          }
        });
      },
      { rootMargin: "-130px 0px -60% 0px", threshold: 0 }
    );

    Object.values(categoryRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isLoading, availableCategories]);

  // ── Scroll to a category section ──
  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    const el = categoryRefs.current[cat];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // ── Skeleton Grid ──
  const SkeletonGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl overflow-hidden border border-white/[0.04]">
          <div className="h-44 sm:h-48 bg-white/[0.06]" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-white/[0.06] rounded-full w-3/4" />
            <div className="h-3 bg-white/[0.06] rounded-full w-full" />
            <div className="h-3 bg-white/[0.06] rounded-full w-1/2" />
            <div className="flex justify-between items-center pt-1">
              <div className="h-5 bg-white/[0.06] rounded-full w-16" />
              <div className="h-8 bg-white/[0.06] rounded-lg w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* ── Page Header ── */}
      <div className="px-4 sm:px-6 pt-6 pb-3">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <h1 className="text-3xl sm:text-4xl font-serif text-white">
            Our <span className="text-amber-400">Menu</span>
          </h1>
          <p className="text-white/40 mt-1 text-sm sm:text-base">
            Order your favourite dishes from LaCasa
          </p>
        </motion.div>
      </div>

      {/* ── Sticky Search + Category Bar ── */}
      <div className="sticky top-[52px] sm:top-[60px] z-40 bg-[#0b0b0b]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">

          {/* Search & Filter Row */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 text-sm transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Veg Filter */}
            <button
              onClick={() => { setVegOnly(!vegOnly); setNonVegOnly(false); }}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition whitespace-nowrap ${
                vegOnly
                  ? "bg-green-500/15 border-green-500/40 text-green-400"
                  : "bg-white/[0.06] border-white/10 text-white/50 hover:border-white/20"
              }`}
            >
              <span className={`w-3.5 h-3.5 border-2 border-green-500 rounded-sm flex items-center justify-center`}>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              </span>
              Veg
            </button>

            {/* Non-Veg Filter */}
            <button
              onClick={() => { setNonVegOnly(!nonVegOnly); setVegOnly(false); }}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition whitespace-nowrap ${
                nonVegOnly
                  ? "bg-red-500/15 border-red-500/40 text-red-400"
                  : "bg-white/[0.06] border-white/10 text-white/50 hover:border-white/20"
              }`}
            >
              <span className={`w-3.5 h-3.5 border-2 border-red-500 rounded-sm flex items-center justify-center`}>
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              </span>
              Non-Veg
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="hidden sm:block bg-white/[0.06] border border-white/10 text-white/50 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="default" className="bg-[#1a1a2e]">Relevance</option>
              <option value="rating" className="bg-[#1a1a2e]">Rating</option>
              <option value="price-low" className="bg-[#1a1a2e]">Price: Low → High</option>
              <option value="price-high" className="bg-[#1a1a2e]">Price: High → Low</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition whitespace-nowrap ${
                showFilters || priceRange[0] > 0 || priceRange[1] < 500
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "bg-white/[0.06] border-white/10 text-white/50 hover:border-white/20"
              }`}
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* ── Price Range Filter Panel ── */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-white/[0.06]">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/50 text-xs">Price Range</span>
                      <span className="text-amber-400 text-xs font-semibold">₹{priceRange[0]} — ₹{priceRange[1]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val <= priceRange[1]) setPriceRange([val, priceRange[1]]);
                        }}
                        className="flex-1 accent-amber-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                      />
                      <input
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= priceRange[0]) setPriceRange([priceRange[0], val]);
                        }}
                        className="flex-1 accent-amber-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Quick price buttons */}
                  <div className="flex gap-2">
                    {[
                      { label: "Under ₹100", range: [0, 100] },
                      { label: "₹100-250", range: [100, 250] },
                      { label: "₹250+", range: [250, 500] },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => setPriceRange(p.range)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium border transition ${
                          priceRange[0] === p.range[0] && priceRange[1] === p.range[1]
                            ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                            : "bg-white/[0.04] border-white/[0.06] text-white/40 hover:text-white/60"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setPriceRange([0, 500])}
                      className="px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium text-white/30 hover:text-white/50 transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Scroll Bar */}
          <div
            ref={categoryBarRef}
            className="flex gap-2 mt-3 overflow-x-auto menu-scrollbar-hide pb-1"
          >
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                    : "bg-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white/70"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Menu Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <SkeletonGrid />
        ) : (
          <>
            {/* Search result count */}
            {searchQuery && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/40 text-sm mb-4">
                {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
              </motion.p>
            )}

            {/* Empty State */}
            {Object.keys(sortedGroups).length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-white/60 text-lg font-medium">No dishes found</h3>
                <p className="text-white/30 text-sm mt-1">Try a different search or filter</p>
                <button
                  onClick={() => { setSearchQuery(""); setVegOnly(false); setNonVegOnly(false); }}
                  className="mt-5 px-6 py-2.5 bg-amber-500 text-black rounded-xl text-sm font-semibold hover:bg-amber-400 transition active:scale-95"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}

            {/* Category Sections */}
            {Object.entries(sortedGroups).map(([category, items]) => (
              <section
                key={category}
                ref={(el) => (categoryRefs.current[category] = el)}
                data-category={category}
                className="mb-10"
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-lg sm:text-xl font-bold text-white">{category}</h2>
                  <span className="text-white/25 text-sm">({items.length})</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {items.map((item, i) => (
                    <FoodCard
                      key={item.id}
                      item={item}
                      index={i}
                      onDetailClick={setSelectedItem}
                    />
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>

      {/* ── Scroll to Top ── */}
      <ScrollToTop />

      {/* ── Product Detail Modal ── */}
      <AnimatePresence>
        {selectedItem && (
          <ProductDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}