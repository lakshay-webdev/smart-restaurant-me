import { useCart } from "../context/CartContext";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    increaseQty,
    decreaseQty,
    totalPrice,
  } = useCart();

  const navigate = useNavigate();

  return (
    <div className="bg-white text-black min-h-[80vh] p-6 rounded-2xl shadow-xl">

      <h1 className="text-3xl font-serif mb-8">
        Your Cart
      </h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="space-y-6">

          {cartItems.map((item) => (
            <div
              key={item._id || item.id}
              className="flex justify-between items-center border-b pb-4"
            >
              <div className="flex gap-4 items-center">

                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />

                <div>
                  <h3 className="font-semibold">
                    {item.name}
                  </h3>

                  <p className="text-gray-500">
                    ₹{item.price}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => decreaseQty(item._id || item.id)}
                      className="px-2 bg-gray-200 rounded"
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => increaseQty(item._id || item.id)}
                      className="px-2 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              <button
                onClick={() => removeFromCart(item._id || item.id)}
                className="text-red-500"
              >
                <Trash2 size={18} />
              </button>

            </div>
          ))}

          <div className="flex justify-between items-center pt-4">
            <h3 className="text-lg font-semibold">
              Total
            </h3>
            <p className="text-xl font-bold text-amber-500">
              ₹{totalPrice}
            </p>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-amber-500 text-white py-3 rounded-xl hover:bg-amber-600 transition"
          >
            Checkout
          </button>

        </div>
      )}
    </div>
  );
}
