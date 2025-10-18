import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";

// Read backend URL from environment variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

// Connect to backend Socket.io server
const socket = io(BACKEND_URL);

export default function App() {
  const [value, setValue] = useState("// Loading your realtime editor...");
  const remoteUpdate = useRef(false); // Prevent loops when receiving remote changes

  // Listen to server events
  useEffect(() => {
    // When first connected, receive initial document
    socket.on("init", (doc) => setValue(doc.text));

    // When someone else changes the document
    socket.on("update", (doc) => {
      remoteUpdate.current = true;
      setValue(doc.text);
      // reset flag after short delay
      setTimeout(() => (remoteUpdate.current = false), 50);
    });

    return () => {
      socket.off("init");
      socket.off("update");
    };
  }, []);

  // Handle changes from this user
  function handleEditorChange(newValue) {
    setValue(newValue);
    if (!remoteUpdate.current) {
      socket.emit("change", { text: newValue });
    }
  }

  return (
    <div style={{ height: "100vh" }}>
      <h2 style={{ textAlign: "center", padding: "10px" }}>
        Realtime Collaborative Code Editor ✨
      </h2>
      <Editor
        height="90vh"
        language="javascript"
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
        options={{ automaticLayout: true }}
      />
    </div>
  );
}
