import React from "react";

export default function HallCard({ hall, onBook }) {

return (

<div className="bg-white shadow-lg rounded-xl p-6">

<h2 className="text-xl font-bold mb-2">
{hall.name}
</h2>

<p className="text-gray-600">
Location: {hall.location}
</p>

<p className="text-gray-600">
Seats: {hall.totalSeats}
</p>

<p className="text-green-600 font-bold">
Price Per Head: {hall.pricePerHead}
</p>

<button
onClick={()=>onBook(hall)}
className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
>

Book Now

</button>

</div>

);

}