document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = form.username.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const role = form.querySelector("[name='role']").value;

        // Username validation: starts with alphabet, followed by alphanumeric characters
        if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(username)) {
            alert("Username must start with a letter and can only contain letters and numbers!");
            return;
        }

        // Email validation: starts with alphabet, contains @ and .com
        if (!/^[a-zA-Z][a-zA-Z0-9._]*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/.test(email)) {
            alert("Email must start with a letter, contain @ and a domain (like .com)!");
            return;
        }

        // Password validation
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{7,}/.test(password)) {
            alert("Password must be at least 7 characters long, include an uppercase letter, a lowercase letter, and a special character!");
            return;
        }

        fetch("http://localhost:8081/api/user/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password, role }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.message === "User registered successfully!" || data.message === "Admin registered successfully!") {
                window.location.href = "login.html"; 
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Signup failed. Please try again.");
        });
    });
});