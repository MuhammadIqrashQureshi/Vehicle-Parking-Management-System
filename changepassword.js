document.addEventListener("DOMContentLoaded", () => {
    const changePasswordBtn = document.getElementById("changePasswordBtn");
    const statusMessage = document.getElementById("statusMessage");

    const loggedInEmail = localStorage.getItem("userEmail");
    console.log("Logged in email:", loggedInEmail);

    if (!loggedInEmail) {
        statusMessage.textContent = "You must be logged in to change your password.";
        statusMessage.style.color = "red";
        changePasswordBtn.disabled = true;
        return;
    }

    changePasswordBtn.addEventListener("click", () => {
        const emailInput = document.getElementById("email").value.trim();
        const currentPassword = document.getElementById("currentPassword").value.trim();
        const newPassword = document.getElementById("newPassword").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        if (!emailInput || !currentPassword || !newPassword || !confirmPassword) {
            statusMessage.textContent = "Please fill in all fields.";
            statusMessage.style.color = "red";
            return;
        }

        if (emailInput !== loggedInEmail) {
            statusMessage.textContent = "Email does not match your login email.";
            statusMessage.style.color = "red";
            return;
        }

        if (newPassword !== confirmPassword) {
            statusMessage.textContent = "New passwords do not match.";
            statusMessage.style.color = "red";
            return;
        }

        fetch("http://localhost:8081/api/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: emailInput,
                currentPassword,
                newPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            statusMessage.textContent = data.message;
            statusMessage.style.color = data.message.toLowerCase().includes("success") ? "green" : "red";

            if (data.message.toLowerCase().includes("success")) {
                setTimeout(() => {
                    window.location.href = "login.html"; 
                }, 1500);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            statusMessage.textContent = "Something went wrong. Please try again.";
            statusMessage.style.color = "red";
        });
    });
});
