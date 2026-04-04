import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { Star, Plus, Minus } from "lucide-react";

export default function FoodCard({ item, index = 0, onDetailClick }) {
  const { cartItems, addToCart, increaseQty, decreaseQty } = useCart();
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [addBounce, setAddBounce] = useState(false);

  const itemId = item.id ?? item._id;
  const cartItem = cartItems.find(
    (ci) => (ci.id ?? ci._id) === itemId
  );
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addToCart(item);
    setAddBounce(true);
    setTimeout(() => setAddBounce(false), 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group bg-white/[0.05] backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-amber-500/10 hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/[0.05] hover:border-amber-500/20"
      onClick={() => onDetailClick?.(item)}
    >
      {/* ── Image ── */}
      <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-amber-900/20 to-gray-900">
        {!imgError ? (
          <>
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${imgLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md"}`}
            />
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 to-gray-800 animate-pulse" />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-40">
            🍽️
          </div>
        )}

        {/* Rating */}
        {item.rating && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-green-600/90 backdrop-blur-sm text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
            <Star size={10} fill="white" />
            {item.rating}
          </div>
        )}

        {/* Bestseller Badge */}
        {item.bestseller && (
          <div className="absolute top-2 left-2 bg-amber-500 text-black text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-md">
            Bestseller
          </div>
        )}

        {/* Trending Badge */}
        {item.rating >= 4.6 && !item.bestseller && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-md flex items-center gap-1">
            🔥 Trending
          </div>
        )}

        {/* Veg / Non-Veg Indicator */}
        <div
          className={`absolute top-2 right-2 w-5 h-5 border-2 rounded-sm flex items-center justify-center bg-black/40 backdrop-blur-sm ${
            item.isVeg ? "border-green-500" : "border-red-500"
          }`}
        >
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              item.isVeg ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-white text-sm sm:text-[15px] truncate leading-tight">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-white/40 text-[11px] sm:text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 gap-2">
          <span className="text-amber-400 font-bold text-sm sm:text-base">
            ₹{item.price}
          </span>

          {/* ADD / Qty Controls */}
          <div onClick={(e) => e.stopPropagation()}>
            {quantity === 0 ? (
              <motion.button
                onClick={handleAdd}
                animate={addBounce ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] sm:text-xs px-5 sm:px-5 py-2 sm:py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20 uppercase tracking-wide"
              >
                Add
              </motion.button>
            ) : (
              <div className="flex items-center bg-amber-500 rounded-lg overflow-hidden shadow-md shadow-amber-500/20">
                <button
                  onClick={() => decreaseQty(item.id || item._id)}
                  className="px-2.5 py-2 sm:py-1.5 hover:bg-amber-400 transition text-black"
                >
                  <Minus size={13} strokeWidth={3} />
                </button>
                <span className="text-black font-bold text-xs min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => increaseQty(item.id || item._id)}
                  className="px-2.5 py-2 sm:py-1.5 hover:bg-amber-400 transition text-black"
                >
                  <Plus size={13} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
