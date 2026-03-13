import React from "react";

export default function Navbar() {
  return (
    <div className="bg-gray-900 text-white p-4 flex justify-between items-center">

      <h1 className="text-2xl font-bold">
        Marriage Hall Portal
      </h1>

      <div className="space-x-4">
        <a href="/" className="hover:text-yellow-400">Home</a>
        <a href="/admin" className="hover:text-yellow-400">Admin</a>
      </div>

    </div>
  );
}