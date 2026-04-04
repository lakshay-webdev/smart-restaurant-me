const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const rateLimit = require("express-rate-limit")
const connectDB = require("./config/db")

// Load env variables
dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000

// ================= MIDDLEWARE =================

app.use(cors())
app.use(express.json())

// ── Rate Limiting ──
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again after 15 minutes" }
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // stricter for auth routes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later" }
})

app.use("/api/", apiLimiter)
app.use("/api/auth/", authLimiter)

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ================= CONNECT DATABASE =================

connectDB()

// ================= ROUTES IMPORT =================

const orderRoutes = require("./routes/orderRoutes")
const itemRoutes = require("./routes/itemRoutes")
const authRoutes = require("./routes/authRoutes")
const menuRoutes = require("./routes/menuRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const reservationRoutes = require("./routes/reservationRoutes")
const settingsRoutes = require("./routes/settingsRoutes")
const adminRoutes = require("./routes/adminRoutes")

// ================= API ROUTES =================

app.use("/api/orders", orderRoutes)
app.use("/api/items", itemRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/menu", menuRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/reservations", reservationRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/admin", adminRoutes)

// ================= ROOT ROUTE =================

app.get("/", (req, res) => {
  res.send("Restaurant Backend API Running Successfully")
})

// ================= 404 HANDLER =================

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  })
})

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error("Error:", err.message)
  res.status(err.status || 500).json({
    message: err.message || "Server Error",
    error: process.env.NODE_ENV === "development" ? err : {}
  })
})

// ================= SERVER START =================

app.listen(PORT, () => {
  console.log("TEST LOG: Server is starting with console logging enabled")
  console.log("\n======================================")
  console.log(`Restaurant Backend Running`)
  console.log(`Server: http://localhost:${PORT}`)
  console.log(`Orders API: http://localhost:${PORT}/api/orders`)
  console.log(`Items API: http://localhost:${PORT}/api/items`)
  console.log(`Auth API: http://localhost:${PORT}/api/auth`)
  console.log(`Menu API: http://localhost:${PORT}/api/menu`)
  console.log("======================================\n")
})
