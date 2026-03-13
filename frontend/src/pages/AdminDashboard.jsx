import React,{useEffect,useState} from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function AdminDashboard(){

const [employees,setEmployees]=useState([]);

useEffect(()=>{
api.get("/employees").then(res=>setEmployees(res.data));
},[]);

return(

<div>

<Navbar/>

<div className="p-10">

<h1 className="text-3xl font-bold mb-6">
Admin Dashboard
</h1>

<table className="w-full border">

<thead className="bg-gray-200">

<tr>

<th className="p-2">Name</th>
<th className="p-2">Role</th>

</tr>

</thead>

<tbody>

{employees.map(e=>(
<tr key={e._id}>

<td className="p-2">{e.name}</td>
<td className="p-2">{e.role}</td>

</tr>
))}

</tbody>

</table>

</div>

</div>

)

}