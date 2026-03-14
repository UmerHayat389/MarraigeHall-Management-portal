import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home          from "./pages/Home";
import AdminPanel    from "./pages/AdminPanel";
import BookingStatus from "./pages/BookingStatus";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/admin"          element={<AdminPanel />} />
        <Route path="/booking-status" element={<BookingStatus />} />
      </Routes>
    </BrowserRouter>
  );
}