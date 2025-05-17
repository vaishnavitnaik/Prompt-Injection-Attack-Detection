
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import HeroImage from "./assets/HeroImg.jpg"; // Import Hero image

export default function Login() {
  const users = {
    vaishnavi: "testvaishnavi",
    tanaya: "testtanaya",
    isha: "testisha",
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (users[username] === password) {
      localStorage.setItem("loggedInUser", username);
      setError("");
      navigate("/queryinput");
    } else {
      setError("Invalid username or password!");
    }
  };

  return (
    <>
      <section
        className="text-white bg-cover bg-center"
        style={{ backgroundImage: `url(${HeroImage})` }}
      >
        <div className="bg-black bg-opacity-60 h-full w-full">
          <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
                Welcome Back!
              </h1>
              <p className="mx-auto mt-4 max-w-xl sm:text-xl/relaxed text-white">
                Secure access to your AI-powered workspace. Log in below to get started with safe and private large language model interactions.
              </p>

              {error && (
                <p className="text-red-500 text-sm text-center mb-3">{error}</p>
              )}

              <div className="bg-white bg-opacity-90 backdrop-blur-md  p-8 rounded-2xl shadow-2xl w-full max-w-md mx-auto mt-8">
                <h2 className="text-2xl font-bold text-center mb-4 text-black">
                  Login to Your Account
                </h2>
                <input
                  type="text"
                  placeholder="Username"
                  className="text-black w-full px-4 py-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="text-black w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition duration-200"
                >
                  Login
                </button>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to="/signup"
                  className="block w-full rounded border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-white focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
                >
                  Get Started
                </Link>

                <a
                  className="block w-full rounded border border-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring active:bg-blue-500 sm:w-auto"
                  href="#"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-blue-600 text-white text-center text-sm text-gray-500 py-4">
        &copy; {new Date().getFullYear()} LLM SecureLogin. All rights reserved.
      </footer>
    </>
  );
}
