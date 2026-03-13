import React,{useEffect,useState} from "react";
import api from "../services/api";
import HallCard from "../components/HallCard";
import BookingModal from "../components/BookingModal";
import Navbar from "../components/Navbar";

export default function Home(){

const [halls,setHalls]=useState([]);
const [selectedHall,setSelectedHall]=useState(null);

useEffect(()=>{

api.get("/halls").then(res=>setHalls(res.data));

},[]);

return(

<div>

<Navbar/>

<div className="bg-gray-100 min-h-screen p-10">

<h1 className="text-4xl font-bold text-center mb-10">
Marriage Hall Booking
</h1>

<div className="grid grid-cols-3 gap-6">

{halls.map(h=>(
<HallCard key={h._id} hall={h} onBook={setSelectedHall}/>
))}

</div>

</div>

{selectedHall && <BookingModal hall={selectedHall}/>}

</div>

)

}