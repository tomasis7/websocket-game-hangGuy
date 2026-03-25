// This is the main entry point for the React client application.
// It renders the App component inside the root DOM element using React 18's createRoot API.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
