async function login(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try{

const res = await fetch("http://localhost:3000/api/login",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email,
password
})

});

const data = await res.json();

if(!res.ok){
alert(data.message);
return;
}

alert("Login successful");

// store token
localStorage.setItem("token", data.token);
localStorage.setItem("role", data.role);

// 🔵 AUTOMATIC BLOCKCHAIN ROLE REGISTRATION

if(data.role === "manufacturer"){

await fetch("http://localhost:3000/register-manufacturer",{
method:"POST",
headers:{
"Authorization":"Bearer "+data.token
}
});

window.location.href = "manufacturer.html";

}

else if(data.role === "distributor"){

await fetch("http://localhost:3000/register-distributor",{
method:"POST",
headers:{
"Authorization":"Bearer "+data.token
}
});

window.location.href = "distributor.html";

}

else if(data.role === "pharmacy"){

await fetch("http://localhost:3000/register-pharmacy",{
method:"POST",
headers:{
"Authorization":"Bearer "+data.token
}
});

window.location.href = "pharmacy.html";

}

else if(data.role === "admin"){

window.location.href = "admin.html";

}

}catch(error){

console.error(error);
alert("Login failed");

}

}