

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import HeroImage from "./assets/HeroImg.jpg"; // Import Hero image

export default function QueryInput() {
  const [prompt, setPrompt] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [result, setResult] = useState(null);
  const [language, setLanguage] = useState("en");
  const [secondPin, setSecondPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const navigate = useNavigate();

  const replacements = {
    delete: "ewwbu",
    erase: "ewwbu",
    remove: "ewwbu",
    truncate: "ewwbu",
    transfer: "pthrand",
    send: "pthrand",
    move: "pthrand",
    shift: "pthrand",
    update: "towex",
    modify: "towex",
    change: "towex",
    alter: "towex",
    edit: "towex",
  };

  const replaceKeywords = (text) =>
    text.replace(
      new RegExp(`\\b(${Object.keys(replacements).join("|")})\\b`, "gi"),
      (matched) => replacements[matched.toLowerCase()]
    );

  const detectPromptInjection = (inputText) => {
    const patterns = [
      "delete",
      "transfer",
      "update",
      "ignore",
      "disregard",
      "skip",
      "forget",
      "neglect",
      "omit",
      "bypass",
      "without",
      "exclude",
    ];
    const regex = new RegExp(`\\b(${patterns.join("|")})\\b`, "gi");
    const matches = inputText.match(regex);
    return matches ? `Malicious query detected: ${matches.join(", ")}` : null;
  };

  const determineActionType = (text) => {
    const types = {
      READ: [],
      UPDATE: ["towex"],
      DELETE: ["ewwbu"],
      TRANSFER: ["pthrand"],
    };
    for (let type in types) {
      if (types[type].some((key) => text.includes(key))) return type;
    }
    return "READ";
  };

  const saveHistoryToCSV = () => {
    const csvContent = [
      "username,password,accessright,pin used,timestamp,sqlquery,result",
      ...history.map((item) => {
        const timestamp = new Date().toISOString();
        return `${item.username},${item.password},${item.accessright},${item.pin},${timestamp},"${item.sqlquery.replace(/"/g, '""')}","${item.result.replace(/"/g, '""')}"`;
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "query_history-2.csv");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
  
    const correctedPrompt = replaceKeywords(prompt);
    const injectionMessage = detectPromptInjection(correctedPrompt);
  
    if (injectionMessage) {
      setLoading(false);
      setMessage(injectionMessage);
      return;
    }
  
    const actionType = determineActionType(correctedPrompt);
  
    if (!["abc", "xyz", "xyzabc"].includes(pin)) {
      setLoading(false);
      setMessage("❌ You don't have permission to READ.");
      return;
    }
    if (
      (actionType === "UPDATE" || actionType === "TRANSFER") &&
      !["xyz", "xyzabc"].includes(pin)
    ) {
      setLoading(false);
      setMessage("❌ You don't have permission to UPDATE or TRANSFER.");
      return;
    }

    if (actionType === "DELETE" && !(pin === "xyzabc" && secondPin === "123321")) {
      setLoading(false);
      setMessage("❌ You need the correct confirmation PIN and admin access to delete.");
      return;
    }
    
    
    
  
    try {
      const response = await fetch("http://127.0.0.1:3000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: correctedPrompt,
          password: pin,
          second_pin: secondPin,
          source_lang: language,
          username: localStorage.getItem("loggedInUser") || "user1",
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setMessage(`❌ Error: ${data.error}`);
        setSqlQuery("");
        setResult(null);
      } else {
        setMessage("✅ Query executed successfully!");
        setSqlQuery(data.sql || correctedPrompt);
        setResult(data.result);
        const newHistoryItem = {
          username: localStorage.getItem("loggedInUser") || "user1",
          password: pin,
          accessright: actionType,
          pin: secondPin,
          sqlquery: data.sql || correctedPrompt,
          result: JSON.stringify(data.result),
          timestamp: new Date().toISOString(),
        };
  
        const updatedHistory = [...history, newHistoryItem];
        setHistory(updatedHistory);
      }
    } catch (error) {
      console.error("Server error:", error);
      setMessage("❌ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleLogout = () => {
    setPrompt("");
    setPin("");
    setSecondPin("");
    setSqlQuery("");
    setResult(null);
    setMessage("");
    setHistory([]);
    navigate("/");
  };

  const handleHindi = () => {
    navigate("/llmhindi");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage("📋 SQL query copied to clipboard!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-blue-100">
      <nav className="bg-blue-950 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">Finance LLM</h1>
        {/* <button
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-900"
          onClick={handleHindi}
        >
          LLM Hindi
        </button> */}
        <button
          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
          onClick={handleLogout}
        >
          Logout
        </button>
        
      </nav>

      <main style={{ backgroundImage: `url(${HeroImage})` }} className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="bg-blue-950 shadow-2xl rounded-2xl p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            Finance LLM Query
          </h2>
          <p className="text-center text-white mb-6">
            Enter your query securely. Prompt injection is actively blocked.
          </p>

          <div className="mb-4 text-center">
            <span className="text-sm  text-white">Detected Action: </span>
            <span className="text-sm font-semibold text-purple-600">
              {determineActionType(replaceKeywords(prompt))}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-400"
              rows="4"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask your financial query..."
              required
            />

            <input
              type="password"
              className="w-full p-3 border rounded-lg"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              required
            />

            {["delete", "remove", "erase", "truncate"].some(word =>
              prompt.toLowerCase().includes(word)
            ) && (
              <input
                type="password"
                className="w-full p-3 border rounded-lg"
                value={secondPin}
                onChange={(e) => setSecondPin(e.target.value)}
                placeholder="Enter confirmation PIN"
              />
            )}

            <select
              className="w-full p-3 border rounded-lg"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="mr">Marathi</option>
              <option value="hi">Hinglish</option>
              <option value="de">German</option>
            </select>

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
                  setPrompt("");
                  setMessage("");
                  setSqlQuery("");
                  setResult(null);
                }}
                className="flex-1 bg-gray-300 text-white py-2 rounded-lg hover:bg-gray-400"
              >
                Clear
              </button>
            </div>
          </form>

          {message && (
            <p className="mt-4 text-center text-sm text-red-600 animate-pulse">
              {message}
            </p>
          )}

          {sqlQuery && (
            <div className="mt-6 bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-black">Generated SQL:</h3>
                <button
                  onClick={() => copyToClipboard(sqlQuery)}
                  className="text-blue-500 text-sm hover:underline"
                >
                  Copy
                </button>
              </div>
              <pre className="text-sm text-black whitespace-pre-wrap break-words">
                {sqlQuery}
              </pre>
            </div>
          )}

          {result && Array.isArray(result) && result.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold  text-white mb-2">Query Result:</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <tbody>
                    {result.map((row, rowIndex) => (
                      <tr key={rowIndex} className="bg-gray-50 border-t border-gray-300">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="p-2 text-center border-l border-gray-300">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-white mb-2">Query History:</h3>
              <ul className="list-disc list-inside text-sm text-white space-y-2">
                {history.map((item, index) => (
                  <li key={index}>
                    <strong>SQL:</strong> {item.sqlquery}<br />
                    <strong>Result:</strong> {item.result}
                  </li>
                ))}
              </ul>

            </div>
          )}
        </div>
      </main>

      <footer className="bg-blue-950 text-center text-sm text-white py-4">
        &copy; {new Date().getFullYear()} Finance LLM. All rights reserved.
      </footer>
    </div>
  );
  
}
