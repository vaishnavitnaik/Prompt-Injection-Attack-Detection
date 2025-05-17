// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import "./App.css";
// import QueryInput from "./QueryInput";
// import Login from "./Login";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// function App() {
//   return (
//     <>
//       {/* <QueryInput/> */}
//       {/* <Login/> */}
//       <Router>
//         <Routes>
//           <Route path="/" element={<Login />} />
//           <Route path="/queryinput" element={<QueryInput />} />
//         </Routes>
//       </Router>
//     </>
//   );
// }

// export default App;
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QueryInput from "./QueryInput";
import Login from "./Login";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
// import QueryInputHi from "./QueryInputHi";
import BankAssistant from "./BankAssistant";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/queryinput" element={<QueryInput />} />
        <Route path="/admin-login" element={<AdminLogin setIsAdmin={setIsAdmin} />} />
        <Route path="/admindashboard" element={<AdminDashboard/>} />
        {/* <Route path="/llmhindi" element={<QueryInputHi/>}/> */}
        <Route path='/bankbot' element={<BankAssistant/>}/>
        <Route
          path="/admin"
          element={isAdmin ? <AdminDashboard /> : <AdminLogin setIsAdmin={setIsAdmin} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
