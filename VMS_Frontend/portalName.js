document.addEventListener("DOMContentLoaded", () => {
    const portalName = localStorage.getItem("portalName") || "Admin Portal";
    document.getElementById("portalTitle").textContent = portalName;
});
