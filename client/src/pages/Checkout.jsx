import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import toast from "react-hot-toast"

export default function Checkout() {

  const { cartItems, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  const [name,setName] = useState("")
  const [phone,setPhone] = useState("")
  const [address,setAddress] = useState("")

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

  const handleOrder = async(e)=>{

    e.preventDefault()

    // Final validation
    if(phone.length !== 10){
      toast.error("Phone number must be exactly 10 digits")
      return
    }

    try{

      await axios.post("http://localhost:5000/api/orders",{
        name,
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

  return(

    <div className="min-h-screen bg-white text-black p-6">

      <h1 className="text-3xl font-serif mb-8">
        Checkout
      </h1>

      <div className="grid md:grid-cols-2 gap-8">

        {/* ORDER SUMMARY */}

        <div className="bg-gray-100 p-6 rounded-xl">

          <h2 className="text-xl font-semibold mb-4">
            Your Order
          </h2>

          {cartItems.map(item=>(

            <div
              key={item._id || item.id}
              className="flex items-center justify-between border-b py-3"
            >

              <div className="flex items-center gap-3">

                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />

                <div>

                  <p className="font-medium">
                    {item.name}
                  </p>

                  <p className="text-gray-500 text-sm">
                    Qty: {item.quantity}
                  </p>

                </div>

              </div>

              <p className="font-semibold">
                ₹{item.price * item.quantity}
              </p>

            </div>

          ))}

          <div className="mt-6 flex justify-between text-lg font-semibold">

            <span>Total</span>

            <span className="text-amber-500">
              ₹{totalPrice}
            </span>

          </div>

        </div>


        {/* ADDRESS FORM */}

        <form
          onSubmit={handleOrder}
          className="bg-gray-100 p-6 rounded-xl space-y-4"
        >

          <h2 className="text-xl font-semibold">
            Delivery Details
          </h2>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={handleNameChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={handlePhoneChange}
            className="w-full p-3 border rounded-lg"
            maxLength="10"
            required
          />

          <textarea
            placeholder="Full Address"
            value={address}
            onChange={(e)=>setAddress(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />

          <button
            type="submit"
            className="w-full bg-amber-500 text-white py-3 rounded-xl"
          >
            Place Order
          </button>

        </form>

      </div>

    </div>

  )

}