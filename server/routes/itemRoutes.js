const express = require("express")
const router = express.Router()

let items = []

// Get All Items
router.get("/", (req,res)=>{
    try {
        res.json(items)
    } catch(err) {
        console.error("Error fetching items:", err)
        res.status(500).json({ message: "Failed to fetch items" })
    }
})

// Add Item
router.post("/", (req,res)=>{
    try {
        const { name, price, image } = req.body
        
        if (!name || !price || !image) {
            return res.status(400).json({ message: "Missing required fields" })
        }

        const newItem = {
            id: Date.now(),
            name,
            price,
            image
        }

        items.push(newItem)

        res.json({
            message:"Item Added",
            item:newItem
        })
    } catch(err) {
        console.error("Error adding item:", err)
        res.status(500).json({ message: "Failed to add item" })
    }
})

// Update Item
router.put("/:id",(req,res)=>{
    try {
        const { name, price, image } = req.body
        
        if (!name || !price || !image) {
            return res.status(400).json({ message: "Missing required fields" })
        }

        const item = items.find(i=>i.id == req.params.id)

        if(!item) {
            return res.status(404).json({ message: "Item not found" })
        }

        item.name = name
        item.price = price
        item.image = image

        res.json({message:"Item Updated", item})
    } catch(err) {
        console.error("Error updating item:", err)
        res.status(500).json({ message: "Failed to update item" })
    }
})

// Delete Item
router.delete("/:id",(req,res)=>{
    try {
        const item = items.find(i=>i.id == req.params.id)
        if(!item) {
            return res.status(404).json({ message: "Item not found" })
        }

        items = items.filter(i=>i.id != req.params.id)

        res.json({message:"Item Deleted"})
    } catch(err) {
        console.error("Error deleting item:", err)
        res.status(500).json({ message: "Failed to delete item" })
    }
})

module.exports = router