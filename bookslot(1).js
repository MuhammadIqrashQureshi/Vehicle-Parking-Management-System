document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("bookingForm");
    const slotSelect = document.getElementById("slot");
    const statusMessage = document.getElementById("statusMessage");

    // Retrieve the logged-in user's email from localStorage
    const loggedInEmail = localStorage.getItem("userEmail");
    console.log("Logged IN eMIAL:",loggedInEmail);
    fetch("http://localhost:8081/api/my-slots")
        .then(response => response.json())
        .then(slots => {
            slotSelect.innerHTML = "";
            if (slots.length === 0) {
                slotSelect.innerHTML = "<option>No available slots</option>";
            } else {
                slots.forEach(slot => {
                    const option = document.createElement("option");
                    option.value = slot.id;
                    option.textContent = slot.slot_time;
                    slotSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error("Error fetching slots:", error);
            slotSelect.innerHTML = "<option>No available slots</option>";
        });

    bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailInput = document.getElementById("email").value.trim();
        const slotId = parseInt(slotSelect.value, 10);
        console.log("Entered Email:", emailInput);
        console.log("Logged In Email:", loggedInEmail);

        if (!emailInput || !slotId) {
            statusMessage.textContent = "Please enter a valid email and select a slot.";
            statusMessage.style.color = "red";
            return;
        }

        // Check if the entered email matches the logged-in email
        if (!loggedInEmail || emailInput !== loggedInEmail) {
            statusMessage.textContent = "Error: The entered email does not match your login email!";
            statusMessage.style.color = "red";
            return;
        }

        console.log("Sending Data:", { email: emailInput, slotId });

        fetch("http://localhost:8081/api/book-slot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailInput, slotId }),
        })
        .then(response => response.json())
        .then(data => {
            statusMessage.textContent = data.message;
            statusMessage.style.color = data.message.includes("success") ? "green" : "red";

            if (data.message.includes("success")) {
                setTimeout(() => window.location.reload(), 1500);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            statusMessage.textContent = "Booking failed. Please try again.";
            statusMessage.style.color = "red";
        });
    });
});
