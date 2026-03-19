import { useState, useEffect } from "react"
import axios from "axios"

export default function AdminMenu(){

const [items,setItems] = useState([])
const [search,setSearch] = useState("")
const [editing,setEditing] = useState(null)

const [form,setForm] = useState({
name:"",
price:"",
category:"",
image:"",
description:""
})

useEffect(()=>{
fetchItems()
},[])

const fetchItems = async()=>{
try {
const res = await axios.get("http://localhost:5000/api/menu")
setItems(res.data)
} catch(error) {
console.error("Error fetching items:", error)
}
}

const handleChange = (e)=>{
setForm({...form,[e.target.name]:e.target.value})
}

const addItem = async(e)=>{
e.preventDefault()

try {
await axios.post("http://localhost:5000/api/menu",form)

fetchItems()

setForm({
name:"",
price:"",
category:"",
image:"",
description:""
})
} catch(error) {
console.error("Error adding item:", error)
}
}

const deleteItem = async(id)=>{
try {
await axios.delete(`http://localhost:5000/api/menu/${id}`)
fetchItems()
} catch(error) {
console.error("Error deleting item:", error)
}
}

const toggleAvailability = async(item)=>{
try {
await axios.patch(
`http://localhost:5000/api/menu/${item._id}/toggle`
)

fetchItems()
} catch(error) {
console.error("Error toggling availability:", error)
}
}

const startEdit = (item)=>{
setEditing(item)
setForm(item)
}

const updateItem = async()=>{
try {
await axios.put(
`http://localhost:5000/api/menu/${editing._id}`,
form
)

setEditing(null)
fetchItems()
} catch(error) {
console.error("Error updating item:", error)
}
}

const filteredItems = items.filter(item =>
item.name.toLowerCase().includes(search.toLowerCase())
)

return(

<div className="min-h-screen bg-[#0f0f0f] text-white p-4 md:p-8">

<h1 className="text-2xl md:text-3xl text-yellow-400 mb-6">
Admin Menu
</h1>

{/* ADD ITEM */}

<form
onSubmit={addItem}
className="bg-[#1a1a1a] p-4 md:p-6 rounded-xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
>

<input
name="name"
placeholder="Food Name"
value={form.name}
onChange={handleChange}
className="p-3 bg-black rounded"
/>

<input
name="price"
placeholder="Price"
value={form.price}
onChange={handleChange}
className="p-3 bg-black rounded"
/>

<input
name="category"
placeholder="Category"
value={form.category}
onChange={handleChange}
className="p-3 bg-black rounded"
/>

<input
name="image"
placeholder="Image URL"
value={form.image}
onChange={handleChange}
className="p-3 bg-black rounded"
/>

<textarea
name="description"
placeholder="Description"
value={form.description}
onChange={handleChange}
className="p-3 bg-black rounded md:col-span-2"
/>

<button className="bg-yellow-500 text-black py-3 rounded md:col-span-2">
Add Item
</button>

</form>

{/* SEARCH */}

<input
placeholder="Search food..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="mb-8 p-3 rounded bg-[#1a1a1a] w-full"
/>

{/* FOOD CARDS */}

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

{filteredItems.map(item=>(
<div
key={item._id}
className="bg-[#1a1a1a] rounded-xl p-4"
>

<img
src={item.image}
className="w-full h-40 object-cover rounded"
/>

<h3 className="text-lg mt-3">
{item.name}
</h3>

<p className="text-gray-400">
{item.category}
</p>

<p className="text-yellow-400 text-lg">
₹{item.price}
</p>

<button
onClick={()=>toggleAvailability(item)}
className={`mt-2 px-3 py-1 rounded ${
item.available
? "bg-green-500"
: "bg-gray-500"
}`}
>

{item.available ? "Available":"Out of Stock"}

</button>

<div className="flex gap-2 mt-3">

<button
onClick={()=>startEdit(item)}
className="bg-yellow-500 text-black px-3 py-1 rounded"
>
Edit
</button>

<button
onClick={()=>deleteItem(item._id)}
className="bg-red-500 px-3 py-1 rounded"
>
Delete
</button>

</div>

</div>
))}

</div>

{/* EDIT MODAL */}

{editing &&(

<div className="fixed inset-0 bg-black/70 flex items-center justify-center">

<div className="bg-[#1a1a1a] p-6 rounded-xl w-80">

<h2 className="text-xl mb-4">
Edit Item
</h2>

<input
name="name"
value={form.name}
onChange={handleChange}
className="p-3 bg-black rounded w-full mb-3"
/>

<input
name="price"
value={form.price}
onChange={handleChange}
className="p-3 bg-black rounded w-full mb-3"
/>

<button
onClick={updateItem}
className="bg-yellow-500 text-black px-4 py-2 rounded w-full"
>
Update
</button>

</div>

</div>

)}

</div>

)

}