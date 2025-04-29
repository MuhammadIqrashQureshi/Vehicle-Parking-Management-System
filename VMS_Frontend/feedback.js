document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded - feedback form script running"); // Debug log
    
    const form = document.getElementById("feedbackForm");
    if (!form) {
        console.error("Feedback form not found!");
        return;
    }

    form.addEventListener("submit", async function(event) {
        event.preventDefault();
        console.log("Form submission started"); // Debug log

        const enteredEmail = document.getElementById("email").value.trim();
        const rating = document.getElementById("rating").value;
        const comments = document.getElementById("comments").value;
        const loggedInEmail = localStorage.getItem("userEmail");

        console.log("Entered email:", enteredEmail); // Debug
        console.log("Stored email:", loggedInEmail); // Debug

        // Validation
        if (!enteredEmail || !rating) {
            alert("Please enter your email and select a rating.");
            return;
        }

        // Email verification
        if (!loggedInEmail || enteredEmail !== loggedInEmail) {
            alert("Error: Entered email does not match your login email!");
            return;
        }

        try {
            console.log("Sending feedback data to server..."); // Debug
            const response = await fetch("http://localhost:8081/api/submitFeedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: enteredEmail,
                    rating: rating,
                    comments: comments
                })
            });

            const result = await response.json();
            console.log("Server response:", result); // Debug

            if (response.ok) {
                alert("Feedback submitted successfully!");
                window.location.href = "mainpage.html";
            } else {
                alert("Failed to submit feedback: " + (result.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("Network error. Please check your connection and try again.");
        }
    });
});