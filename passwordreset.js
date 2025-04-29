document.getElementById("resetForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    let userId = 1; 
    let userType = document.getElementById("userType").value;
    let newPassword = document.getElementById("new-password").value;
    let confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    let response = await fetch("http://localhost:3000/reset-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: userId,  
            userType: userType,
            password: newPassword
        })
    });

    let data = await response.json();

    if (data.success) {
        alert("Password updated successfully!");
        window.location.href = "login.html";
    } else {
        alert("Error updating password.");
    }
});
