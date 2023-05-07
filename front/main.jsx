import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Listen from "./routes/listen";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
    },
    {
        path: "/listen",
        element: <Listen />,
    },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
