async function register() {

const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;
const role = document.getElementById("role").value;

if (!name || !email || !password || !role) {
alert("Please fill all fields");
return;
}

try {

const res = await fetch("http://localhost:3000/api/register", {

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
name,
email,
password,
role
})

});

const data = await res.json();

alert(data.message);

if(res.status === 201){
window.location.href = "login.html";
}

} catch (err) {

console.error(err);
alert("Registration failed");

}

}