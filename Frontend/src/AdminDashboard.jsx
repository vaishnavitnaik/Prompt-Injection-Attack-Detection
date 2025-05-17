// import { useEffect, useState } from "react";
// import Papa from "papaparse";

// export default function AdminDashboard() {
//   const [data, setData] = useState([]);
//   const [headers, setHeaders] = useState([]);
//   const [showAll, setShowAll] = useState(false);
//   const fileName = "query_logs.csv";

//   useEffect(() => {
//     fetch("/query_logs.csv")
//       .then((response) => response.text())
//       .then((csvText) => {
//         Papa.parse(csvText, {
//           header: true,
//           skipEmptyLines: true,
//           complete: function (results) {
//             const parsedData = results.data || [];
//             setHeaders(results.meta.fields || []);
//             setData(parsedData);
//           },
//         });
//       })
//       .catch((error) => {
//         console.error("Error loading CSV:", error);
//       });
//   }, []);

//   const rowsToShow = showAll ? data : data.slice(-5);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-8">
//       <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-6xl mx-auto">
//         <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">
//           Admin Query Logs Viewer
//         </h1>

//         <p className="text-center text-sm text-gray-600 mb-4">
//           Loaded file: <span className="font-semibold">{fileName}</span>
//         </p>

//         {data.length > 0 ? (
//           <>
//             <div className="overflow-x-auto mb-4">
//               <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
//                 <thead className="bg-blue-200 text-gray-800">
//                   <tr>
//                     {headers.map((header, idx) => (
//                       <th key={idx} className="p-3 border text-left">
//                         {header}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {rowsToShow.map((row, rowIndex) => (
//                     <tr
//                       key={rowIndex}
//                       className="even:bg-gray-50 border-t border-gray-300"
//                     >
//                       {headers.map((header, cellIndex) => (
//                         <td
//                           key={cellIndex}
//                           className="p-2 border whitespace-pre-wrap break-words"
//                         >
//                           {row[header]}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {!showAll && (
//               <div className="text-center">
//                 <button
//                   onClick={() => setShowAll(true)}
//                   className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
//                 >
//                   Show More
//                 </button>
//               </div>
//             )}
//           </>
//         ) : (
//           <p className="text-center text-gray-500 mt-10">
//             No query logs found.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const fileName = "query_logs.csv";

  useEffect(() => {
    fetch("/query_logs.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: function (results) {
            const parsedData = results.data || [];
            setHeaders(results.meta.fields || []);
            setData(parsedData);
          },
        });
      })
      .catch((error) => {
        console.error("Error loading CSV:", error);
      });
  }, []);

  const rowsToShow = showAll ? data : data.slice(-5);

  // Prepare aggregated counts for charts
  const promptInjectionCounts = {};
  const deleteActionCounts = {};

  data.forEach((row) => {
    const username = row.Username || "Unknown";
    const action = row.Action;
    const sql = row.SQLQuery?.toUpperCase() || "";

    if (action === "PROMPT_INJECTION") {
      promptInjectionCounts[username] = (promptInjectionCounts[username] || 0) + 1;
    }

    if (sql.includes("DELETE")) {
      deleteActionCounts[username] = (deleteActionCounts[username] || 0) + 1;
    }
  });

  const promptChartData = Object.entries(promptInjectionCounts).map(
    ([user, count]) => ({ user, count })
  );

  const deleteChartData = Object.entries(deleteActionCounts).map(
    ([user, count]) => ({ user, count })
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">
          Admin Query Logs Viewer
        </h1>

        <p className="text-center text-sm text-gray-600 mb-4">
          Loaded file: <span className="font-semibold">{fileName}</span>
        </p>

        {data.length > 0 ? (
          <>
            {/* Prompt Injection Chart */}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Users with PROMPT_INJECTION Activity</h2>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={promptChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="user" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Delete Action Chart */}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Users with DELETE Actions</h2>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deleteChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="user" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table Viewer */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-blue-200 text-gray-800">
                  <tr>
                    {headers.map((header, idx) => (
                      <th key={idx} className="p-3 border text-left">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowsToShow.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="even:bg-gray-50 border-t border-gray-300"
                    >
                      {headers.map((header, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="p-2 border whitespace-pre-wrap break-words"
                        >
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!showAll && (
              <div className="text-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                >
                  Show More
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            No query logs found.
          </p>
        )}
      </div>
    </div>
  );
}



