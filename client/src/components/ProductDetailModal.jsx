import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Star, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";

const SPICE_OPTIONS = ["Mild", "Medium", "Spicy", "Extra Spicy"];

const CATEGORY_EXTRAS = {
  "Starters": [
    { name: "Extra Chutney", price: 15 },
    { name: "Extra Dip", price: 20 },
    { name: "Double Portion", price: 80 },
    { name: "Lemon & Onion Rings", price: 10 },
  ],
  "Main Course": [
    { name: "Extra Gravy", price: 20 },
    { name: "Extra Paneer", price: 50 },
    { name: "Extra Butter", price: 15 },
    { name: "Double Portion", price: 80 },
  ],
  "Rice & Biryani": [
    { name: "Extra Raita", price: 25 },
    { name: "Extra Salan", price: 20 },
    { name: "Boiled Egg", price: 15 },
    { name: "Double Portion", price: 80 },
  ],
  "Breads": [
    { name: "Extra Butter", price: 10 },
    { name: "Stuffed with Paneer", price: 30 },
    { name: "With Garlic Topping", price: 10 },
  ],
  "Chinese": [
    { name: "Extra Soy Sauce", price: 10 },
    { name: "Extra Schezwan", price: 15 },
    { name: "Add Paneer", price: 40 },
    { name: "Double Portion", price: 80 },
  ],
  "Fast Food": [
    { name: "Extra Cheese", price: 30 },
    { name: "Extra Mayo", price: 15 },
    { name: "Add Fries", price: 40 },
    { name: "Upsize", price: 50 },
  ],
  "Beverages": [
    { name: "Extra Sugar", price: 0 },
    { name: "Add Ice Cream Scoop", price: 30 },
    { name: "Large Size", price: 30 },
  ],
  "Desserts": [
    { name: "Extra Ice Cream Scoop", price: 30 },
    { name: "Chocolate Sauce", price: 20 },
    { name: "Whipped Cream", price: 15 },
    { name: "Double Portion", price: 60 },
  ],
};

export default function ProductDetailModal({ item, onClose }) {
  const { addToCart, increaseQty } = useCart();
  const [imgError, setImgError] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState("Medium");
  const [extras, setExtras] = useState([]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setExtras([]);
    setQty(1);
    setSpiceLevel("Medium");
  }, [item]);

  if (!item) return null;

  const extrasTotal = extras.reduce((sum, ext) => sum + ext.price, 0);
  const unitPrice = item.price + extrasTotal;
  const totalPrice = unitPrice * qty;

  const toggleExtra = (extra) => {
    setExtras((prev) =>
      prev.find((e) => e.name === extra.name)
        ? prev.filter((e) => e.name !== extra.name)
        : [...prev, extra]
    );
  };

  const handleAddToCart = () => {
    // Build cart item with extras baked into the price
    const cartProduct = {
      ...item,
      price: unitPrice,
      extras: extras.length > 0 ? extras.map((e) => e.name) : undefined,
      spiceLevel,
    };
    addToCart(cartProduct);
    for (let i = 1; i < qty; i++) {
      increaseQty(item.id || item._id);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Wrapper */}
      <motion.div
        className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-[#141419] sm:rounded-2xl rounded-t-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl border border-white/10 menu-scrollbar-hide"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 transition"
          >
            <X size={18} />
          </button>

          {/* Image */}
          <div className="relative h-56 sm:h-64 bg-gradient-to-br from-amber-900/20 to-gray-900 overflow-hidden sm:rounded-t-2xl rounded-t-2xl">
            {!imgError ? (
              <img
                src={item.image}
                alt={item.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl opacity-40">
                🍽️
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141419] via-transparent to-transparent" />

            {/* Rating badge */}
            {item.rating && (
              <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-green-600 text-white text-sm font-bold px-2.5 py-1 rounded-md">
                <Star size={12} fill="white" />
                {item.rating}
              </div>
            )}

            {/* Veg / Non-Veg */}
            <div
              className={`absolute top-4 left-4 w-6 h-6 border-2 rounded-sm flex items-center justify-center bg-black/40 backdrop-blur-sm ${
                item.isVeg ? "border-green-500" : "border-red-500"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  item.isVeg ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 -mt-2">
            {/* Title & Price */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {item.name}
                </h2>
                {item.bestseller && (
                  <span className="inline-block mt-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/20">
                    ⭐ Bestseller
                  </span>
                )}
              </div>
              <span className="text-amber-400 font-bold text-xl shrink-0">
                ₹{item.price}
              </span>
            </div>

            {/* Description */}
            <p className="text-white/50 text-sm mt-3 leading-relaxed">
              {item.description}
            </p>

            <div className="border-t border-white/[0.06] my-5" />

            {/* Spice Level */}
            <div className="mb-5">
              <h4 className="text-white/70 font-semibold text-sm mb-3">
                🌶️ Spice Level
              </h4>
              <div className="flex flex-wrap gap-2">
                {SPICE_OPTIONS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSpiceLevel(level)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      spiceLevel === level
                        ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                        : "bg-white/[0.06] text-white/50 hover:bg-white/10"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Extras */}
            <div className="mb-5">
              <h4 className="text-white/70 font-semibold text-sm mb-3">
                ✨ Add Extras
              </h4>
              <div className="space-y-2">
                {(CATEGORY_EXTRAS[item.category] || CATEGORY_EXTRAS["Main Course"]).map((extra) => {
                  const selected = extras.find((e) => e.name === extra.name);
                  return (
                    <button
                      key={extra.name}
                      onClick={() => toggleExtra(extra)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                        selected
                          ? "bg-amber-500/10 border border-amber-500/30 text-white"
                          : "bg-white/[0.04] border border-white/[0.06] text-white/50 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${
                            selected
                              ? "bg-amber-500 border-amber-500"
                              : "border-white/20"
                          }`}
                        >
                          {selected && (
                            <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span>{extra.name}</span>
                      </div>
                      <span className={selected ? "text-amber-400 font-semibold" : "text-white/30"}>
                        +₹{extra.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/[0.06] my-5" />

            {/* Quantity + Add to Cart */}
            <div className="flex items-center justify-between gap-4">
              {/* Qty Selector */}
              <div className="flex items-center gap-1 bg-white/[0.06] rounded-xl border border-white/[0.06]">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-2.5 hover:bg-white/10 rounded-l-xl transition"
                >
                  <Minus size={16} className="text-white/60" />
                </button>
                <span className="font-bold text-lg min-w-[32px] text-center text-white">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="p-2.5 hover:bg-white/10 rounded-r-xl transition"
                >
                  <Plus size={16} className="text-white/60" />
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 text-sm sm:text-base"
              >
                Add to Cart — ₹{totalPrice}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
