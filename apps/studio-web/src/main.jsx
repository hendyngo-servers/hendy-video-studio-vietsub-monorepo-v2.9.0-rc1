import React from "react";
import { createRoot } from "react-dom/client";
import StudioWebApp from "./App";
import "../../../src/index.css";
import "./styles.css";

const mount = document.getElementById("root");
if (mount) createRoot(mount).render(<React.StrictMode><StudioWebApp /></React.StrictMode>);
