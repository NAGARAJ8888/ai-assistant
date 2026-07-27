"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function UploadPage() {
  const { getToken } = useAuth();
  const [file, setFile] = useState<File | null>(null);

  async function uploadFile() {
    if (!file) {
      alert("Please select a PDF");
      return;
    }

    const token = await getToken();

    const formData = new FormData();
    formData.append("document", file);

    const response = await fetch(
      "http://localhost:5000/api/documents/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();
    console.log(data);
  }

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
          }
        }}
      />

      <button onClick={uploadFile}>
        Upload
      </button>
    </div>
  );
}