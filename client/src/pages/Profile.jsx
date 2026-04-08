import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogOut, Package, User, Mail, CalendarDays, Clock, Users, Phone } from "lucide-react";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      // Fetch orders from API for this user
      if (parsed?.email) {
        axios.get(`/api/orders/my-orders/${encodeURIComponent(parsed.email)}`)
          .then(res => setOrders(res.data || []))
          .catch(() => setOrders([]));
        // Fetch reservations
        axios.get(`/api/reservations/my/${encodeURIComponent(parsed.email)}`)
          .then(res => setReservations(res.data || []))
          .catch(() => setReservations([]));
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-5xl mb-4 opacity-40">👤</div>
        <p className="text-white/40 mb-4 text-sm">You are not logged in</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-amber-500 text-black px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-400 transition active:scale-95"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-2xl sm:text-3xl font-serif text-white mb-6 sm:mb-8">
          My <span className="text-amber-400">Profile</span>
        </h1>

        {/* User Info Card */}
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <User size={22} className="text-amber-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-white truncate">
                  {user.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} className="text-white/30 shrink-0" />
                  <p className="text-white/40 text-xs sm:text-sm truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-red-500/20 transition active:scale-95"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "orders"
                ? "bg-amber-500 text-black"
                : "bg-white/[0.06] text-white/50 hover:bg-white/[0.1]"
            }`}
          >
            <Package size={16} />
            Orders
          </button>
          <button
            onClick={() => setActiveTab("reservations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "reservations"
                ? "bg-amber-500 text-black"
                : "bg-white/[0.06] text-white/50 hover:bg-white/[0.1]"
            }`}
          >
            <CalendarDays size={16} />
            Reservations
            {reservations.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === "reservations" ? "bg-black/20 text-black" : "bg-amber-500/20 text-amber-400"
              }`}>
                {reservations.length}
              </span>
            )}
          </button>
        </div>

        {/* Order History */}
        {activeTab === "orders" && (
          <>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3 opacity-30">📦</div>
            <p className="text-white/30 text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.map(order => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 sm:p-5 hover:border-white/10 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm">{order.id}</p>
                    <p className="text-white/30 text-xs mt-0.5">{order.date}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      order.status === "Delivered"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-amber-400 text-sm">
                      ₹{order.total}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

          </>
        )}

        {/* Reservations */}
        {activeTab === "reservations" && (
          <>
            {reservations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-30">🍽️</div>
                <p className="text-white/30 text-sm">No reservations yet</p>
                <button
                  onClick={() => navigate("/book-table")}
                  className="mt-4 bg-amber-500 text-black px-5 py-2 rounded-xl text-sm font-semibold hover:bg-amber-400 transition"
                >
                  Book a Table
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {reservations.map(reservation => (
                  <motion.div
                    key={reservation._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 sm:p-5 hover:border-white/10 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} className="text-amber-400 shrink-0" />
                          <p className="font-semibold text-white text-sm">
                            {new Date(reservation.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {reservation.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} /> {reservation.guests} guests
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={12} /> {reservation.phone}
                          </span>
                        </div>
                      </div>

                      <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${
                        reservation.status === "Confirmed"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : reservation.status === "Cancelled"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {reservation.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
