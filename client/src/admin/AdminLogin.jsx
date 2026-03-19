import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"

export default function AdminLogin() {

  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {

    e.preventDefault()
    setLoading(true)

    try {
      // Call backend API for admin authentication
      const response = await axios.post("http://localhost:5000/api/admin/login", {
        username,
        password
      })

      if (response.data.token) {
        localStorage.setItem("adminAuth", response.data.token)
        toast.success("Login successful!")
        navigate("/admin")
      } else {
        toast.error("Invalid credentials")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed")
      console.error("Login error:", error)
    } finally {
      setLoading(false)
    }

  }

  return (

    <div className="min-h-screen bg-black flex items-center justify-center px-4">

      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">

        <h2 className="text-3xl text-white font-serif mb-6 text-center">
          Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 py-3 rounded-lg font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>

  )

}