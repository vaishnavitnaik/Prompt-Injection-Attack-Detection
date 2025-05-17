import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import HeroImage from "./assets/HeroImg.jpg";

export default function BankAssistant() {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUserInput("");
    setResponse("");
    setMessage("");
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setResponse("");

    try {
      const res = await fetch("http://127.0.0.1:5000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userInput,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data.response);
      } else {
        setMessage(data.error || "An error occurred.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-blue-100">
      <nav className="bg-blue-950 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">Bank Assistant</h1>
        <button
          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>

      <main style={{ backgroundImage: `url(${HeroImage})` }} className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="bg-blue-950 shadow-2xl rounded-2xl p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-center text-white mb-2">Banking Help</h2>
          <p className="text-center text-white mb-6">
            Ask anything related to your banking needs. Prompt injection is actively blocked.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-400"
              rows="4"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your banking question here..."
              required
            />

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                {loading ? "Processing..." : "Submit"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserInput("");
                  setResponse("");
                  setMessage("");
                }}
                className="flex-1 bg-gray-300 text-white py-2 rounded-lg hover:bg-gray-400"
              >
                Clear
              </button>
            </div>
          </form>

          {message && (
            <p className="mt-4 text-center text-sm text-red-600 animate-pulse">{message}</p>
          )}

          {response && (
            <div className="mt-6 bg-gray-100 p-4 rounded-lg text-black">
              <h3 className="font-semibold mb-2">Response:</h3>
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-blue-950 text-center text-sm text-white py-4">
        &copy; {new Date().getFullYear()} Bank Assistant. All rights reserved.
      </footer>
    </div>
  );
}