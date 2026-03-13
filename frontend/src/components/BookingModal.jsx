import React,{useState} from "react";
import api from "../services/api";

export default function BookingModal({hall}){

const [guests,setGuests]=useState(0);

const total = guests * hall.pricePerHead;

const book = async ()=>{

await api.post("/bookings",{
guests,
totalPrice: total
});

alert("Booking Successful");

};

return(

<div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

<div className="bg-white p-6 rounded-xl w-96">

<h2 className="text-xl font-bold mb-4">
Book {hall.name}
</h2>

<input
type="number"
placeholder="Number of Guests"
className="border p-2 w-full mb-3"
onChange={(e)=>setGuests(e.target.value)}
/>

<p className="mb-3">
Total Price: <span className="font-bold">{total}</span>
</p>

<button
onClick={book}
className="bg-green-500 text-white px-4 py-2 rounded w-full"
>

Confirm Booking

</button>

</div>

</div>

)

}