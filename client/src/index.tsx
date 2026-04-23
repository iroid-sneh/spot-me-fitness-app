import "./index.css";
import React from "react";
import { render } from "react-dom";
import { App } from "./App";
import { AdminAuthProvider } from "./context/AdminAuthContext";

render(
  <AdminAuthProvider>
    <App />
  </AdminAuthProvider>,
  document.getElementById("root")
);
