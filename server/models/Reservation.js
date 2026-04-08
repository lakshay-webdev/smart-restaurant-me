const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: "" },
  phone: { type: String, required: true },
  guests: { type: Number, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Reservation", reservationSchema);
