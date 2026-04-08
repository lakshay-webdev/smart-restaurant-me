import { motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { CalendarDays, Clock, Users, User, Phone, CheckCircle } from "lucide-react";

const timeSlots = [
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
];

export default function BookTable() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!time) {
      toast.error("Please select a time slot");
      return;
    }

    if (!phone || phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      const reservationData = {
        name,
        email: user?.email || "",
        phone,
        guests,
        date,
        time
      };
      
      await axios.post("/api/reservations", reservationData);

      toast.success("✅ Reservation confirmed!");
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setName("");
        setPhone("");
        setGuests(2);
        setDate("");
        setTime("");
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Reservation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="book-table"
      className="py-16 sm:py-24 px-4 sm:px-6 text-white"
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-8 bg-amber-500" />
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">
              Reservations
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif">
            Reserve Your <span className="text-amber-400">Table</span>
          </h2>
          <p className="text-white/40 mt-2 text-sm sm:text-base max-w-lg">
            Choose your preferred time & enjoy luxury dining
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">

          {/* FORM SIDE */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.03] border border-white/[0.06] p-5 sm:p-7 rounded-2xl space-y-5"
          >
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm text-white/50 mb-2">
                <User size={14} className="text-amber-400" /> Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 outline-none text-white placeholder-white/25 text-sm transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm text-white/50 mb-2">
                <Phone size={14} className="text-amber-400" /> Phone Number
              </label>
              <input
                type="tel"
                required
                maxLength="10"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit phone number"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 outline-none text-white placeholder-white/25 text-sm transition"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm text-white/50 mb-2">
                <Users size={14} className="text-amber-400" /> Number of Guests
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => guests > 1 && setGuests(guests - 1)}
                  className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/10 transition text-white/60 font-bold"
                >
                  −
                </button>
                <span className="text-lg font-bold text-white min-w-[32px] text-center">{guests}</span>
                <button
                  type="button"
                  onClick={() => setGuests(guests + 1)}
                  className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/10 transition text-white/60 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm text-white/50 mb-2">
                <CalendarDays size={14} className="text-amber-400" /> Select Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 outline-none text-white text-sm transition [color-scheme:dark]"
              />
            </div>

            {/* Time Slots */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm text-white/50 mb-2">
                <Clock size={14} className="text-amber-400" /> Select Time
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                      time === slot
                        ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20"
                        : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white/70"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? "Confirming..." : "Confirm Reservation"}
            </button>

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 text-emerald-400 text-sm"
              >
                <CheckCircle size={16} />
                Reservation Confirmed!
              </motion.div>
            )}
          </motion.form>

          {/* SUMMARY CARD */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.03] border border-white/[0.06] p-5 sm:p-7 rounded-2xl flex flex-col"
          >
            <h3 className="text-xl sm:text-2xl font-serif mb-6">
              Reservation <span className="text-amber-400">Summary</span>
            </h3>

            <div className="space-y-4 flex-1">
              {[
                { label: "Name", value: name, icon: <User size={14} /> },
                { label: "Phone", value: phone, icon: <Phone size={14} /> },
                { label: "Guests", value: guests, icon: <Users size={14} /> },
                { label: "Date", value: date, icon: <CalendarDays size={14} /> },
                { label: "Time", value: time, icon: <Clock size={14} /> },
              ].map((field) => (
                <div key={field.label} className="flex items-center gap-3 py-3 border-b border-white/[0.04]">
                  <span className="text-amber-400/60">{field.icon}</span>
                  <div className="flex-1">
                    <p className="text-white/30 text-[11px] uppercase tracking-wider">{field.label}</p>
                    <p className="text-white text-sm font-medium">
                      {field.value || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
              <p className="text-white/40 text-xs">
                ✨ Please arrive 10 minutes before your reserved time. Smart-casual attire recommended.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
