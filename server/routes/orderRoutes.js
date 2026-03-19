const express = require("express")
const nodemailer = require("nodemailer")
const router = express.Router()
const Order = require("../models/Order")

// Nodemailer transporter for order emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Send order confirmation email
async function sendOrderConfirmationEmail(email, order) {
  const itemsHtml = order.items.map(item => `
    <tr style="border-bottom:1px solid #333;">
      <td style="padding:12px;text-align:left;">${item.name}</td>
      <td style="padding:12px;text-align:center;">x${item.quantity}</td>
      <td style="padding:12px;text-align:right;">&#8377;${item.price}</td>
    </tr>
  `).join("")

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#1a1a1a;border-radius:16px;color:#fff;">
      <h2 style="color:#f59e0b;text-align:center;">Smart Restaurant</h2>
      <p style="text-align:center;font-size:18px;margin:20px 0;">Order Confirmation</p>
      
      <div style="background:#333;padding:20px;border-radius:12px;margin:20px 0;">
        <p style="margin:8px 0;"><strong>Order ID:</strong> ${order._id}</p>
        <p style="margin:8px 0;"><strong>Name:</strong> ${order.name}</p>
        <p style="margin:8px 0;"><strong>Phone:</strong> ${order.phone}</p>
        <p style="margin:8px 0;"><strong>Delivery Address:</strong> ${order.address}</p>
      </div>

      <p style="font-size:14px;font-weight:bold;color:#f59e0b;margin-top:20px;">Order Items:</p>
      <table style="width:100%;border-collapse:collapse;margin:15px 0;">
        <thead>
          <tr style="background:#f59e0b;color:#000;">
            <th style="padding:12px;text-align:left;">Item</th>
            <th style="padding:12px;text-align:center;">Qty</th>
            <th style="padding:12px;text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="background:#333;padding:20px;border-radius:12px;margin:20px 0;text-align:right;">
        <p style="margin:8px 0;font-size:16px;"><strong>Total Amount: &#8377;${order.totalAmount}</strong></p>
        <p style="margin:8px 0;color:#f59e0b;font-size:14px;"><strong>Status: ${order.status}</strong></p>
      </div>

      <p style="text-align:center;color:#999;font-size:13px;margin-top:20px;">Thank you for your order! We'll notify you when it's ready for delivery.</p>
      <p style="text-align:center;color:#f59e0b;font-size:12px;">Smart Restaurant Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Smart Restaurant" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Smart Restaurant - Order Confirmation #${order._id}`,
    html
  });
}

// Helper to escape HTML
function escapeHtml(str) {
  if (typeof str !== "string") return str
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

// PLACE ORDER
router.post("/", async (req, res) => {
  try {
    const { name, phone, address, items, total, email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required for order confirmation" })
    }

    const order = new Order({
      name,
      phone,
      address,
      items,
      totalAmount: total,
      status: "Pending"
    })

    await order.save()

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(email, order)
    } catch (emailErr) {
      console.error("Failed to send order confirmation email:", emailErr)
      // Continue with order creation even if email fails
    }

    res.json({
      message: "Order placed successfully",
      order
    })
  } catch (err) {
    console.error("Order placement error:", err)
    res.status(500).json({ message: "Failed to place order" })
  }
})

// JSON API
router.get("/json", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json({
      totalOrders: orders.length,
      orders
    })
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" })
  }
})

// CHROME VIEW (Styled Orders) - XSS safe
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })

    let rows = orders.map(order => {
      let items = (order.items || []).map(item => `
        <div>${escapeHtml(item.name)} (x${item.quantity}) - &#8377;${item.price}</div>
      `).join("")

      return `
        <tr>
          <td>${escapeHtml(String(order._id))}</td>
          <td>${escapeHtml(order.name)}</td>
          <td>${escapeHtml(order.phone)}</td>
          <td>${escapeHtml(order.address)}</td>
          <td>${items}</td>
          <td>&#8377;${order.totalAmount}</td>
          <td>${escapeHtml(order.status)}</td>
          <td>${order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</td>
        </tr>
      `
    }).join("")

    res.send(`
    <html>
    <head>
    <title>Restaurant Orders</title>
    <style>
    body{font-family:Arial;background:#0f172a;color:white;padding:30px;}
    h1{margin-bottom:20px;}
    table{width:100%;border-collapse:collapse;background:#1e293b;}
    th,td{padding:12px;border:1px solid #334155;text-align:left;}
    th{background:#f59e0b;color:black;}
    tr:hover{background:#334155;}
    </style>
    </head>
    <body>
    <h1>Restaurant Orders Dashboard</h1>
    <table>
    <tr>
    <th>Order ID</th><th>Name</th><th>Phone</th><th>Address</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th>
    </tr>
    ${rows}
    </table>
    </body>
    </html>
    `)
  } catch (err) {
    res.status(500).send("Error loading orders")
  }
})

// UPDATE STATUS
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json({ message: "Order updated", order })
  } catch (err) {
    res.status(500).json({ message: "Failed to update order" })
  }
})

module.exports = router
