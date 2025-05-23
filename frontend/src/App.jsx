import React, { useState } from "react";
import BoundingBox from "react-bounding-box";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setPredictions([]);
    setImageId(null);
    setImageUrl(null);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setPredictions([]);
    // Step 1: Upload
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

      // Step 2: Analyze
      const res = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: data.image_id }),
      });
      const predData = await res.json();
      if (predData.predictions) {
        setPredictions(predData.predictions);
      } else {
        setPredictions([]);
        alert("Prediction failed: " + (predData.error || "Unknown error"));
      }
    } catch (err) {
      alert("Upload or analysis failed. " + err.message);
    }
    setLoading(false);
  };

  // Convert predictions to [x, y, width, height] format for BoundingBox
  const boxes = predictions.map((pred) => [
    pred.x - pred.width / 2,
    pred.y - pred.height / 2,
    pred.width,
    pred.height,
  ]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "rgba(240, 240, 240, 0.9)",
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginTop: 32, marginBottom: 16 }}>
        Dental X-ray DICOM Uploader
      </h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <input
          type="file"
          accept=".dcm,.rvg"
          onChange={handleFileChange}
          style={{ marginBottom: 12 }}
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
            marginBottom: 16,
          }}
        >
          {loading ? "Processing..." : "Upload & Analyze"}
        </button>
      </div>
      {/* Two-Panel Layout: Images */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 32,
          marginTop: 24,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 25,
            margin: "0 auto",
          }}
        >
          {/* Left: Original Image */}
          <div
            style={{
              minWidth: 0,
              minHeight: 300,
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 0,
              width: 400,
              height: 400,
              overflow: "hidden",
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Original X-ray"
                style={{
                  maxWidth: 400,
                  maxHeight: 400,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: 4,
                }}
              />
            ) : (
              <span style={{ color: "#888" }}>
                Uploaded image will appear here
              </span>
            )}
          </div>
          {/* Right: Analyzed Image with Bounding Boxes */}
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 400,
              height: 400,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {imageUrl && predictions.length > 0 ? (
              <div
                style={{
                  width: 400,
                  height: 400,
                  position: "relative",
                  display: "contents",
                }}
              >
                <BoundingBox
                  image={imageUrl}
                  boxes={boxes}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: 4,
                    display: "block",
                  }}
                />
              </div>
            ) : (
              <span style={{ color: "#888" }}>
                Analyzed image will appear here
              </span>
            )}
          </div>
        </div>

        {/* Report Section */}
        <div
          style={{
            margin: "32px auto 0 auto",
            maxWidth: 900,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            padding: 24,
            textAlign: "center",
          }}
        >
          {predictions.length > 0 ? (
            <table
              style={{
                width: "100%",
                fontSize: 16,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "center", padding: "8px 16px" }}>
                    Label
                  </th>
                  <th style={{ textAlign: "center", padding: "8px 16px" }}>
                    Confidence
                  </th>
                  <th style={{ textAlign: "center", padding: "8px 16px" }}>Box</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "8px 4px" }}>{pred.class}</td>
                    <td style={{ padding: "8px 4px" }}>
                      {(pred.confidence * 100).toFixed(1)}%
                    </td>
                    <td
                      style={{ padding: "8px 4px" }}
                    >{`[${pred.x}, ${pred.y}, ${pred.width}, ${pred.height}]`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <span style={{ color: "#888" }}>Report will appear here</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
