import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./i18n"; // Import i18n configuration

/**
 * JinnLog Frontend Entry Point
 * 
 * @author Lorenzo DM
 * @since 0.2.0
 */

// Import Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Mount React app
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
