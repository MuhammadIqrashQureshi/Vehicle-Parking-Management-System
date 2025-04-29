document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logoutBtn");
    const userSearch = document.getElementById("userSearch");
    const userTableBody = document.getElementById("userTableBody");
    const paginationContainer = document.querySelector(".pagination");
    const totalUsersElement = document.getElementById("totalUsers");

    // Current page state
    let currentPage = 1;
    const usersPerPage = 5; // Show 5 users per page
    let allUsers = [];
    let filteredUsers = [];

    // Logout functionality
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("user");
        window.location.href = "login.html"; 
    });

    // Fetch users and initialize table
    async function fetchAndDisplayUsers() {
        try {
            const response = await fetch("http://localhost:8081/api/users");
            if (!response.ok) throw new Error("Failed to fetch users");
            
            allUsers = await response.json();
            filteredUsers = [...allUsers]; // Initialize filtered users
            totalUsersElement.textContent = allUsers.length;
            
            renderTable();
            setupPagination();
        } catch (error) {
            console.error("Error fetching users:", error);
            userTableBody.innerHTML = `<tr><td colspan="3" class="error-message">Error loading users. Please try again.</td></tr>`;
        }
    }

    // Render table with paginated data
    function renderTable() {
        const startIndex = (currentPage - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        userTableBody.innerHTML = paginatedUsers.length > 0 
            ? paginatedUsers.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="3">No users found</td></tr>`;
    }

    // Setup pagination buttons
    function setupPagination() {
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        paginationContainer.innerHTML = "";

        // Previous button
        const prevButton = createPaginationButton("<i class='fas fa-chevron-left'></i>", "prev");
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
                updatePaginationButtons();
            }
        });
        paginationContainer.appendChild(prevButton);

        // Page buttons - show maximum 5 page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust if we're at the end
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page button with ellipsis if needed
        if (startPage > 1) {
            const firstButton = createPaginationButton("1");
            firstButton.addEventListener("click", () => {
                currentPage = 1;
                renderTable();
                updatePaginationButtons();
            });
            paginationContainer.appendChild(firstButton);

            if (startPage > 2) {
                const ellipsis = document.createElement("span");
                ellipsis.className = "pagination-ellipsis";
                ellipsis.textContent = "...";
                paginationContainer.appendChild(ellipsis);
            }
        }

        // Numbered buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = createPaginationButton(i.toString());
            if (i === currentPage) {
                pageButton.classList.add("active");
            }
            pageButton.addEventListener("click", () => {
                currentPage = i;
                renderTable();
                updatePaginationButtons();
            });
            paginationContainer.appendChild(pageButton);
        }

        // Last page button with ellipsis if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement("span");
                ellipsis.className = "pagination-ellipsis";
                ellipsis.textContent = "...";
                paginationContainer.appendChild(ellipsis);
            }

            const lastButton = createPaginationButton(totalPages.toString());
            lastButton.addEventListener("click", () => {
                currentPage = totalPages;
                renderTable();
                updatePaginationButtons();
            });
            paginationContainer.appendChild(lastButton);
        }

        // Next button
        const nextButton = createPaginationButton("<i class='fas fa-chevron-right'></i>", "next");
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
                updatePaginationButtons();
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    // Helper function to create pagination buttons
    function createPaginationButton(text, className = "") {
        const button = document.createElement("button");
        button.className = `pagination-btn ${className}`;
        button.innerHTML = text;
        return button;
    }

    // Update button states
    function updatePaginationButtons() {
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        const buttons = paginationContainer.querySelectorAll(".pagination-btn");
        
        buttons.forEach(button => {
            button.classList.remove("active", "disabled");
            
            if (button.textContent === currentPage.toString()) {
                button.classList.add("active");
            }
            
            if ((button.classList.contains("prev") && currentPage === 1) ||
                (button.classList.contains("next") && currentPage === totalPages)) {
                button.disabled = true;
                button.classList.add("disabled");
            } else {
                button.disabled = false;
            }
        });
    }

    // Search functionality
    userSearch.addEventListener("input", function() {
        const searchTerm = this.value.toLowerCase();
        currentPage = 1; // Reset to first page when searching
        
        if (searchTerm === "") {
            filteredUsers = [...allUsers];
        } else {
            filteredUsers = allUsers.filter(user => 
                user.name.toLowerCase().includes(searchTerm) || 
                user.email.toLowerCase().includes(searchTerm) ||
                user.id.toString().includes(searchTerm)
            );
        }
        
        totalUsersElement.textContent = filteredUsers.length;
        renderTable();
        setupPagination();
    });

    // Initialize
    fetchAndDisplayUsers();
});
