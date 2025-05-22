// import React, { useState } from 'react';

// function App() {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [imageId, setImageId] = useState(null);
//   const [imageUrl, setImageUrl] = useState(null);

//   const handleFileChange = (e) => {
//     setSelectedFile(e.target.files[0]);
//   };

//   const handleUpload = async () => {
//     if (!selectedFile) return;
//     const formData = new FormData();
//     formData.append('file', selectedFile);

//     const res = await fetch('http://localhost:8000/upload-dicom/', {
//       method: 'POST',
//       body: formData,
//     });
//     const data = await res.json();
//     setImageId(data.image_id);

//     // Fetch the PNG image
//     setImageUrl(`http://localhost:8000/get-image/${data.image_id}`);
//   };

//   return (
//     <div style={{ padding: 32 }}>
//       <h1>Dental X-ray DICOM Uploader</h1>
//       <div style={{ marginTop: 24 }}>
//         {imageUrl && <img src={imageUrl} alt="Converted X-ray" style={{ maxWidth: 400 }} />}
//       </div>
//       <div style={{ margin: 0, padding: 0 }}>
//         <input type="file" accept=".dcm,.rvg" onChange={handleFileChange} />
//       </div>
//       <div>
//         <button onClick={handleUpload} disabled={!selectedFile}>Upload & Convert</button>
//       </div>
//     </div>
//   );
// }

// export default App;

import React, { useState } from "react";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageId, setImageId] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("http://localhost:8000/upload-dicom", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setImageId(data.image_id);
    setImageUrl(`http://localhost:8000/get-image/${data.image_id}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "rgba(240, 240, 240, 0.9)",
        padding: 0,
        margin: 0,
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginTop: 32, marginBottom: 16 }}>
        Dental X-ray DICOM Uploader
      </h1>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <input
          type="file"
          accept=".dcm,.rvg"
          onChange={handleFileChange}
          style={{ marginBottom: 12 }}
        />
        <button
          onClick={handleUpload}
          disabled={!selectedFile}
          style={{
            padding: "8px 24px",
            borderRadius: 4,
            border: "none",
            background: "#007bff",
            color: "#fff",
            cursor: selectedFile ? "pointer" : "not-allowed",
            marginBottom: 32,
          }}
        >
          Upload & Convert
        </button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 40,
          marginTop: 24,
        }}
      >
        <div
          style={{
            width: 400,
            minHeight: 300,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {imageUrl ? ( <img src={imageUrl} alt="Converted X-ray" style={{ maxWidth:400, maxHeight:400 }} />
          ) : (
            <span style={{ color: "#888" }}>Uploaded image will appear here</span>
          )}
        </div>
        <div
          style={{
            width: 400,
            minHeight: 300,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#888",
          }}
        >
          Analyzed image will appear here
        </div>
      </div>
    </div>
  );
}

export default App;