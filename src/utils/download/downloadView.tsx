// // downloadView.tsx
// import React from "react";
// import { generatePDF } from "./function";

// const DownloadView = ({ data }) => {
//   const safeRows = data?.rows ?? [];
//   const safeColumns = data?.columns ?? [];

//   return (
//     <div style={{ padding: 20 }}>
//       <button
//         onClick={() => generatePDF(data)}
//         style={{
//           padding: "10px 16px",
//           background: "#4F46E5",
//           color: "white",
//           border: "none",
//           borderRadius: 6,
//         }}
//       >
//         Download PDF
//       </button>

//       {safeRows.length === 0 && (
//         <p style={{ color: "red", marginTop: 10 }}>
//           No student data available.
//         </p>
//       )}
//     </div>
//   );
// };

// export default DownloadView;


import React from "react";
import { generatePDF } from "./function";

const DownloadView = ({ data }) => {
  const safeRows = data?.rows ?? [];
  const safeColumns = data?.columns ?? [];

  const canDownload = safeRows.length > 0 && safeColumns.length > 0;
  console.log("DownloadView data:", data);
  console.log("safeRows:", safeRows);
  console.log("safeColumns:", safeColumns);
  console.log("canDownload:", canDownload);
  return (
    <div style={{ padding: 20 }}>
      <button
        disabled={!canDownload}
        onClick={() => generatePDF({ rows: safeRows, columns: safeColumns })}
        style={{
          padding: "10px 16px",
          background: canDownload ? "#4F46E5" : "#9CA3AF",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: canDownload ? "pointer" : "not-allowed",
        }}
      >
        Download PDF
      </button>

      {!canDownload && (
        <p style={{ color: "red", marginTop: 10 }}>
          No data available to download.
        </p>
      )}
    </div>
  );
};

export default DownloadView;

