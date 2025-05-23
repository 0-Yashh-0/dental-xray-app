import React, { useState } from "react";
import AnnotatedImage from "./AnnotatedImage";
import ReactMarkdown from "react-markdown";

function Loader() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #007bff",
          borderRadius: "50%",
          width: 40,
          height: 40,
          animation: "spin 1s linear infinite",
        }}
      />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
      <span style={{ marginTop: 12, color: "#007bff", fontWeight: 500 }}>
        Processing...
      </span>
    </div>
  );
}

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasPredicted, setHasPredicted] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setPredictions([]);
    setImageId(null);
    setImageUrl(null);
    setReport("");
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setPredictions([]);
    setReport("");
    setHasPredicted(false);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/upload-dicom/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!data.image_id) throw new Error("Upload failed");
      setImageId(data.image_id);
      setImageUrl(`http://localhost:8000/get-image/${data.image_id}`);

      // Predict
      const res = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: data.image_id }),
      });
      const predData = await res.json();
      setHasPredicted(true);
      if (predData.predictions) {
        setPredictions(predData.predictions);

        // Generate Report
        const reportRes = await fetch(
          "http://localhost:8000/generate-report/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_id: data.image_id,
              annotations: predData.predictions,
            }),
          }
        );
        const reportData = await reportRes.json();
        setReport(reportData.report || "");
      } else {
        setPredictions([]);
        setReport("");
        alert("Prediction failed: " + (predData.error || "Unknown error"));
      }
    } catch (err) {
      setReport("");
      alert("Upload or analysis failed. " + err.message);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "93vh",
        width: "97vw",
        background: "rgba(240, 240, 240, 0.9)",
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginTop: 32, marginBottom: 16 }}>
        Dental X-ray Dashboard
      </h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 32,
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {/* Left Panel */}
        <div
          style={{
            flex: 1,
            minWidth: 400,
            maxWidth: 500,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            padding: 32,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: 550,
          }}
        >
          <h3>Please upload the image (.dcm/.rvg)</h3>
          <input
            type="file"
            accept=".dcm,.rvg"
            onChange={handleFileChange}
            style={{ marginBottom: 16 }}
          />
          <button
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || loading}
            style={{
              padding: "8px 24px",
              borderRadius: 4,
              border: "none",
              background: "#007bff",
              color: "#fff",
              cursor: selectedFile && !loading ? "pointer" : "not-allowed",
              marginBottom: 24,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            {loading ? "Processing..." : "Upload & Analyze"}
          </button>
          <div
            style={{
              width: 400,
              height: 400,
              background: "#f8f8f8",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            {loading ? (
              <Loader />
            ) : hasPredicted ? (
              predictions.length > 0 ? (
                <AnnotatedImage imageUrl={imageUrl} predictions={predictions} />
              ) : (
                <img
                  src={imageUrl}
                  alt=""
                  style={{
                    width: 400,
                    height: 400,
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              )
            ) : (
              <span style={{ color: "#888" }}>
                Analyzed image will appear here
              </span>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div
          style={{
            flex: 1,
            minWidth: 400,
            maxWidth: 500,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            padding: 32,
            height: 550,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            overflowY: "auto",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}        
        >
          <h2 style={{ marginBottom: 16, color: "#007bff", textAlign: "left" }}>
            Diagnostic Report
          </h2>
          {loading ? (
            <Loader />
          ) : report ? (
            <ReactMarkdown
              children={report}
              components={{
                p: (props) => (
                  <p
                    style={{
                      fontSize: 18,
                      color: "#333",
                      marginBottom: 24,
                      textAlign: "left",
                    }}
                    {...props}
                  />
                ),
                strong: (props) => (
                  <strong style={{ color: "#007bff" }} {...props} />
                ),
                em: (props) => <em style={{ color: "#555" }} {...props} />,
              }}
            />
          ) : (
            <span style={{ color: "#888", marginBottom: 24, display: "block" }}>
              Report will appear here
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
