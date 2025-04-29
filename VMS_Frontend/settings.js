document.addEventListener("DOMContentLoaded", () => {
    let inactivityTimer;
    let sessionCheckInterval;

    // Function to check session status
    async function checkSession() {
        try {
            const response = await fetch("/api/check-session");
            const data = await response.json();
            
            if (!data.loggedIn) {
                endSession();
            }
        } catch (error) {
            console.error("Session check failed:", error);
        }
    }

    // Function to reset inactivity timer
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        const timeoutMinutes = parseInt(document.getElementById("sessionTimeout")?.value) || 1;
        inactivityTimer = setTimeout(endSession, timeoutMinutes * 60 * 1000);
    }

    // Function to end session
    function endSession() {
        clearTimeout(inactivityTimer);
        clearInterval(sessionCheckInterval);
        localStorage.removeItem("user");
        window.location.href = "login.html";
    }

    // Function to ping server to keep session alive
    function pingServer() {
        fetch("/api/ping").catch(console.error);
    }

    // Initialize session management
    function initSessionManagement() {
        // Set up activity detectors
        const activityEvents = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
            window.addEventListener(event, () => {
                resetInactivityTimer();
                pingServer();
            });
        });

        // Check session every 30 seconds
        sessionCheckInterval = setInterval(checkSession, 30000);
        
        // Initialize timer
        resetInactivityTimer();
    }

    // Manual logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async function() {
            try {
                await fetch("/api/logout");
            } finally {
                endSession();
            }
        });
    }

    // Save settings
    const saveBtn = document.getElementById("saveSettingsBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            const adminEmail = document.getElementById("adminEmail").value.trim();
            const sessionTimeout = document.getElementById("sessionTimeout").value;

            if (!adminEmail || !sessionTimeout) {
                alert("All fields are required!");
                return;
            }

            fetch("http://localhost:8081/api/update-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminEmail, sessionTimeout })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Settings updated successfully!");
                    resetInactivityTimer();
                } else {
                    alert("Update failed: " + data.message);
                }
            })
            .catch(err => {
                console.error(err);
                alert("Error updating settings.");
            });
        });
    }

    // Load current settings
    fetch("http://localhost:8081/api/settings")
        .then(res => res.json())
        .then(data => {
            if (data.adminEmail) document.getElementById("adminEmail").value = data.adminEmail;
            if (data.sessionTimeout) document.getElementById("sessionTimeout").value = data.sessionTimeout;
        })
        .finally(() => {
            initSessionManagement();
        });
});
