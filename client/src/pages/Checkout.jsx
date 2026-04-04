import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, MapPin, Tag, X, Share2 } from "lucide-react"

/* ── Available Coupons ── */
const COUPONS = [
  { code: "WELCOME20", discount: 20, type: "percent", minOrder: 200, maxDiscount: 100, description: "20% off on first order (max ₹100)" },
  { code: "LACASA50", discount: 50, type: "flat", minOrder: 300, maxDiscount: 50, description: "Flat ₹50 off on orders above ₹300" },
  { code: "FEAST100", discount: 100, type: "flat", minOrder: 500, maxDiscount: 100, description: "Flat ₹100 off on orders above ₹500" },
  { code: "SAVE15", discount: 15, type: "percent", minOrder: 250, maxDiscount: 75, description: "15% off on orders above ₹250 (max ₹75)" },
];

export default function Checkout() {

  const { cartItems, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [phone,setPhone] = useState("")
  const [address,setAddress] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [showCoupons, setShowCoupons] = useState(false)

  // Name validation (only alphabets)
  const handleNameChange = (e)=>{
    const value = e.target.value
    if(/^[A-Za-z\s]*$/.test(value)){
      setName(value)
    }
  }

  // Phone validation (only numbers & max 10 digits)
  const handlePhoneChange = (e)=>{
    const value = e.target.value
    if(/^\d{0,10}$/.test(value)){
      setPhone(value)
    }
  }

  const taxes = Math.round(totalPrice * 0.05)
  
  // ── Coupon logic ──
  const applyCoupon = (code) => {
    const c = COUPONS.find((cp) => cp.code === code.toUpperCase().trim())
    if (!c) { toast.error("Invalid coupon code"); return }
    if (totalPrice < c.minOrder) { toast.error(`Minimum order ₹${c.minOrder} required`); return }
    setAppliedCoupon(c)
    setCouponCode(c.code)
    toast.success(`Coupon ${c.code} applied!`)
    setShowCoupons(false)
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    toast("Coupon removed")
  }

  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? Math.min(Math.round(totalPrice * appliedCoupon.discount / 100), appliedCoupon.maxDiscount)
      : appliedCoupon.discount
    : 0

  const grandTotal = totalPrice + taxes - couponDiscount

  // ── WhatsApp share ──
  const shareOnWhatsApp = () => {
    const itemLines = cartItems.map((i) => `• ${i.name} x${i.quantity} — ₹${i.price * i.quantity}`).join("\n")
    const msg = `🍽️ *LaCasa Order Summary*\n\n${itemLines}\n\n💰 Subtotal: ₹${totalPrice}\n📦 Delivery: FREE\n🏷️ Tax: ₹${taxes}${couponDiscount > 0 ? `\n🎟️ Discount: -₹${couponDiscount}` : ""}\n✅ *Total: ₹${grandTotal}*\n\nOrder at LaCasa! 🔥`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank")
  }

  const handleOrder = async(e)=>{

    e.preventDefault()

    // Final validation
    if(phone.length !== 10){
      toast.error("Phone number must be exactly 10 digits")
      return
    }

    try{

      await axios.post("/api/orders",{
        name,
        email,
        phone,
        address,
        items: cartItems,
        total: totalPrice
      })

      // Save to localStorage for order history
      const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      savedOrders.push({
        id: "ORD" + Date.now(),
        date: new Date().toLocaleDateString(),
        items: cartItems,
        total: totalPrice,
        status: "Pending"
      })
      localStorage.setItem("orders", JSON.stringify(savedOrders))

      toast.success("Order placed successfully!")

      clearCart()

      navigate("/success")

    }catch(err){

      toast.error("Order Failed")

    }

  }

  const itemCount = cartItems.reduce((a, b) => a + b.quantity, 0)

  return(

    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-serif text-white mb-1">
            <span className="text-amber-400">Checkout</span>
          </h1>
          <p className="text-white/40 text-xs sm:text-sm mb-6 sm:mb-8">
            Review your order and fill in delivery details
          </p>
        </motion.div>

        <div className="flex flex-col-reverse lg:flex-row gap-6">

          {/* LEFT — ADDRESS FORM */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleOrder}
            className="flex-1 bg-white/[0.04] border border-white/[0.06] p-5 sm:p-6 rounded-2xl space-y-4 sm:space-y-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={18} className="text-amber-400" />
              <h2 className="text-white font-semibold text-base sm:text-lg">
                Delivery Details
              </h2>
            </div>

            <div>
              <label className="text-white/40 text-xs sm:text-sm mb-1.5 block">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={handleNameChange}
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 text-sm transition"
                required
              />
            </div>

            <div>
              <label className="text-white/40 text-xs sm:text-sm mb-1.5 block">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 text-sm transition"
                required
              />
            </div>

            <div>
              <label className="text-white/40 text-xs sm:text-sm mb-1.5 block">Phone Number</label>
              <input
                type="text"
                placeholder="10-digit phone number"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 text-sm transition"
                maxLength="10"
                required
              />
            </div>

            <div>
              <label className="text-white/40 text-xs sm:text-sm mb-1.5 block">Delivery Address</label>
              <textarea
                placeholder="Full address with landmark"
                value={address}
                onChange={(e)=>setAddress(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 text-sm transition resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 sm:py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 text-sm sm:text-base mt-2"
            >
              Place Order — ₹{grandTotal}
            </button>
          </motion.form>


          {/* RIGHT — ORDER SUMMARY */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:w-[360px] shrink-0"
          >
            <div className="bg-white/[0.04] border border-white/[0.06] p-5 sm:p-6 rounded-2xl sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={18} className="text-amber-400" />
                <h2 className="text-white font-semibold text-base sm:text-lg">
                  Your Order
                </h2>
                <span className="text-white/30 text-xs">({itemCount})</span>
              </div>

              <div className="space-y-3 max-h-60 sm:max-h-72 overflow-y-auto pr-1 menu-scrollbar-hide">
                {cartItems.map(item=>(
                  <div
                    key={item._id || item.id}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-amber-900/20 to-gray-800 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{item.name}</p>
                      <p className="text-white/30 text-xs">Qty: {item.quantity}</p>
                      {item.extras && item.extras.length > 0 && (
                        <p className="text-amber-400/50 text-[10px] truncate">+ {item.extras.join(", ")}</p>
                      )}
                      {item.spiceLevel && (
                        <p className="text-white/20 text-[10px]">🌶️ {item.spiceLevel}</p>
                      )}
                    </div>
                    <p className="text-amber-400 font-semibold text-sm shrink-0">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bill Breakdown */}
              <div className="border-t border-white/[0.06] mt-4 pt-4 space-y-2.5 text-sm">

                {/* ── Coupon Section ── */}
                <div className="mb-3">
                  {!appliedCoupon ? (
                    <div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                          <input
                            type="text"
                            placeholder="Coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="w-full pl-9 pr-3 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 text-xs transition"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => applyCoupon(couponCode)}
                          className="px-4 py-2.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-semibold hover:bg-amber-500/25 transition"
                        >
                          Apply
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCoupons(!showCoupons)}
                        className="text-amber-400/70 text-[11px] mt-2 hover:text-amber-400 transition"
                      >
                        {showCoupons ? "Hide coupons" : "View available coupons"}
                      </button>

                      <AnimatePresence>
                        {showCoupons && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-2 space-y-2"
                          >
                            {COUPONS.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => applyCoupon(c.code)}
                                className={`w-full text-left px-3 py-2.5 rounded-xl border transition text-xs ${
                                  totalPrice >= c.minOrder
                                    ? "bg-white/[0.04] border-white/[0.08] hover:border-amber-500/30 cursor-pointer"
                                    : "bg-white/[0.02] border-white/[0.04] opacity-40 cursor-not-allowed"
                                }`}
                                disabled={totalPrice < c.minOrder}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-amber-400 font-mono font-bold tracking-wider">{c.code}</span>
                                  {totalPrice < c.minOrder && (
                                    <span className="text-white/30 text-[10px]">Min ₹{c.minOrder}</span>
                                  )}
                                </div>
                                <p className="text-white/40 text-[10px] mt-0.5">{c.description}</p>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-green-400" />
                        <div>
                          <span className="text-green-400 text-xs font-bold">{appliedCoupon.code}</span>
                          <span className="text-green-400/60 text-[10px] ml-2">-₹{couponDiscount} off</span>
                        </div>
                      </div>
                      <button type="button" onClick={removeCoupon} className="text-white/40 hover:text-white transition">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-white/40">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span>Delivery Fee</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span>Taxes (5%)</span>
                  <span>₹{taxes}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="border-t border-white/[0.06] pt-2.5 flex justify-between text-white font-bold text-base">
                  <span>Total</span>
                  <span className="text-amber-400">₹{grandTotal}</span>
                </div>

                {/* WhatsApp Share */}
                <button
                  type="button"
                  onClick={shareOnWhatsApp}
                  className="w-full flex items-center justify-center gap-2 mt-3 py-2.5 rounded-xl bg-green-600/15 border border-green-600/20 text-green-400 text-xs font-medium hover:bg-green-600/25 transition"
                >
                  <Share2 size={14} />
                  Share on WhatsApp
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>

  )

}