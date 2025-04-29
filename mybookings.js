document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        document.getElementById("loader").style.display = "none";
        document.getElementById("content").style.display = "block";
    }, 1500);

    const elements = document.querySelectorAll(".slide-in");
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add("show");
        }, index * 300);
    });

    const bookingCheckForm = document.getElementById("bookingCheckForm");
    const emailInput = document.getElementById("email");
    const bookingsList = document.getElementById("bookingsList");
  

    // Retrieve the logged-in user's email from localStorage
    const loggedInEmail = localStorage.getItem("userEmail");
    console.log("Email from localStorage:", localStorage.getItem("userEmail"));
    
    
    bookingCheckForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const enteredEmail = emailInput.value.trim();
        console.log("Entered Email:", enteredEmail);
        console.log("Logged In Email:", loggedInEmail);
        if (!enteredEmail) {
            alert("Please enter your email.");
            return;
        }

        // Check if entered email matches logged-in email
        if (!loggedInEmail || enteredEmail !== loggedInEmail) {
            alert("Error: The entered email does not match your login email!");
            return;
        }

        fetch(`http://localhost:8081/api/bookings?email=${enteredEmail}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                bookingsList.innerHTML = "";

                if (data.length === 0) {
                    bookingsList.innerHTML = "<p class='no-bookings'>No bookings found</p>";
                    return;
                }

                data.forEach(booking => {
                    const bookingItem = document.createElement("div");
                    bookingItem.classList.add("booking-item");

                    bookingItem.innerHTML = 
                        `<div class="booking-card">
                            <div class="front">
                                <p><strong>Booking ID:</strong> ${booking.id}</p>
                                <p><strong>Slot Time:</strong> ${booking.slot_time || "N/A"}</p>
                            </div>
                            <div class="back">
                                <p><strong>Booked On:</strong> ${booking.booking_time}</p>
                                <button class="cancel-btn" data-booking-id="${booking.id}">Cancel</button>
                            </div>
                        </div>`;

                    bookingsList.appendChild(bookingItem);
                });

                document.querySelectorAll(".cancel-btn").forEach(button => {
                    button.addEventListener("click", function () {
                        const bookingId = this.getAttribute("data-booking-id");
                        cancelBooking(bookingId, this);
                    });
                });
            })
            .catch(error => {
                console.error("Error fetching bookings:", error);
                alert("Failed to load bookings. Check the console for errors.");
            });
    });

    function cancelBooking(bookingId, button) {
        const confirmCancel = confirm("Are you sure you want to cancel this booking?");
        if (!confirmCancel) return;

        fetch(`http://localhost:8081/api/bookings/${bookingId}`, { method: "DELETE" })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const bookingItem = button.closest(".booking-item");
                    bookingItem.classList.add("fade-out");
                    setTimeout(() => {
                        bookingItem.remove();
                        alert("Booking canceled successfully.");
                    }, 500);
                } else {
                    alert("Failed to cancel booking: " + data.message);
                }
            })
            .catch(error => {
                console.error("Error canceling booking:", error);
                alert("Error canceling booking. Try again later.");
            });
    }
});
