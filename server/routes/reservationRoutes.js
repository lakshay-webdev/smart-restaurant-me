const express = require("express");
const Reservation = require("../models/Reservation");
const router = express.Router();

// Create reservation (customer side)
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/reservations - Request body:", JSON.stringify(req.body));
    const { name, email, phone, guests, date, time } = req.body;
    if (!name || !phone || !guests || !date || !time) {
      console.log("Missing fields. Name:", name, "Phone:", phone, "Guests:", guests, "Date:", date, "Time:", time);
      return res.status(400).json({ message: "All fields are required" });
    }
    const reservation = new Reservation({ name, email: email || "", phone, guests, date, time });
    await reservation.save();
    console.log("Reservation created successfully:", reservation._id);
    res.json({ message: "Reservation created", reservation });
  } catch (err) {
    console.error("Reservation creation error:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ message: "Failed to create reservation", error: err.message });
  }
});

// Get reservations by user email
router.get("/my/:email", async (req, res) => {
  try {
    const reservations = await Reservation.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reservations" });
  }
});

// Get all reservations (admin)
router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reservations" });
  }
});

// Update reservation status (admin)
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!reservation) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Reservation updated", reservation });
  } catch (err) {
    res.status(500).json({ message: "Failed to update reservation" });
  }
});

// Delete reservation
router.delete("/:id", async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ message: "Reservation deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete reservation" });
  }
});

module.exports = router;
