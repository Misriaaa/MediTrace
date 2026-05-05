function checkRole(requiredRole) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== requiredRole) {
    alert("Access Denied");
    window.location = "login.html";
  }
}