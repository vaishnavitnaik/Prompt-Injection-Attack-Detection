import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroImage from "./assets/HeroImg.jpg"; // Make sure this path matches your asset location

export default function AdminLogin({ setIsAdmin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      setIsAdmin(true);
      navigate("/admindashboard");
    } else {
      setError("Invalid admin credentials!");
    }
  };

  return (
    <section
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url(${HeroImage})`,
      }}
    >
      <div>
        <div className="bg-white bg-opacity-90 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-96 max-w-full">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
            Admin Login
          </h2>

          {error && (
            <p className="text-red-600 text-sm text-center mb-4 animate-pulse">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
