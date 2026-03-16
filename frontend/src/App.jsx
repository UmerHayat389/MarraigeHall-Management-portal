import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home          from "./pages/Home";
import AdminPanel    from "./admin/AdminPanel";
import BookingStatus from "./pages/BookingStatus";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/booking-status"  element={<BookingStatus />} />
        <Route path="/admin"           element={<AdminPanel />} />
        <Route path="/admin/dashboard" element={<AdminPanel />} />
        <Route path="/admin/halls"     element={<AdminPanel />} />
        <Route path="/admin/bookings"  element={<AdminPanel />} />
        <Route path="/admin/dishes"    element={<AdminPanel />} /> {/* NEW: Dishes Route */}
        <Route path="/admin/calendar"  element={<AdminPanel />} />
        <Route path="*"                element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}