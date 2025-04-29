document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logoutBtn");
    const modal = document.getElementById("slotModal");
    const openModalBtn = document.getElementById("openSlotModal");
    const closeModal = document.querySelector(".close");
    const addSlotBtn = document.getElementById("addSlotBtn");
    const viewSlotsBtn = document.getElementById("viewSlotsBtn");
    const slotContainer = document.getElementById("slotContainer");
    const slotTableBody = document.getElementById("slotTableBody");
    const paginationContainer = document.getElementById("paginationContainer");

   

    let currentPage = 1;
    const pageSize = 5;

    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });

    openModalBtn.addEventListener("click", () => {
        modal.style.display = "block";
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    addSlotBtn.addEventListener("click", async () => {
        const slotTime = document.getElementById("slotTime").value.trim();

        if (!slotTime) {
            alert("Please enter a slot time.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8081/api/addSlot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slot_time: slotTime }),
            });
            const data = await response.json();

            if (data.success) {
                alert("Slot added successfully!");
                modal.style.display = "none";
                fetchSlots(currentPage); // Refresh slots
            } else {
                alert("Failed to add slot: " + data.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong.");
        }
    });

    viewSlotsBtn.addEventListener("click", () => {
        slotContainer.style.display = "block";
        fetchSlots(currentPage);
    });

    async function fetchSlots(page = 1) {
        try {
            const response = await fetch(`http://localhost:8081/api/slots?page=${page}&size=${pageSize}`);
            const result = await response.json();
            renderSlotTable(result.slots);
            renderPagination(result.totalPages, result.currentPage);
        } catch (err) {
            console.error('Failed to fetch slots:', err);
            alert("Failed to fetch slots.");
        }
    }
  
    function renderSlotTable(slots) {
        slotTableBody.innerHTML = '';
    
        if (slots.length === 0) {
            slotTableBody.innerHTML = `<tr><td colspan="3">No slots available</td></tr>`;
            return;
        }
    
        slots.forEach(slot => {
            const row = document.createElement('tr');
            
            let statusClass, statusText;
            switch(slot.status) {
                case 'available':
                    statusClass = 'status-available';
                    statusText = 'Available';
                    break;
                case 'booked':
                    statusClass = 'status-booked';
                    statusText = 'Booked';
                    break;
                case 'used':
                    statusClass = 'status-used';
                    statusText = 'In Use';
                    break;
                default:
                    statusClass = 'status-unknown';
                    statusText = 'Unknown';
            }
    
            row.innerHTML = `
                <td>${slot.id}</td>
                <td>${slot.slot_time}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    ${slot.status === 'available' ? 
                        `<button class="btn delete-slot-btn" data-id="${slot.id}">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>` : 
                        '<span class="text-muted">Cannot delete</span>'
                    }
                </td>
            `;
            slotTableBody.appendChild(row);
        });
    
        attachDeleteListeners();
    }

    function attachDeleteListeners() {
        document.querySelectorAll('.delete-slot-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const slotId = btn.getAttribute('data-id');
                const confirmed = confirm('Are you sure you want to delete this slot?');
                if (!confirmed) return;

                try {
                    const res = await fetch(`http://localhost:8081/api/delete-slot/${slotId}`, {
                        method: 'DELETE'
                    });
                    const result = await res.json();

                    if (res.ok) {
                        alert(result.message);
                        fetchSlots(currentPage);
                    } else {
                        alert(result.message || 'Failed to delete slot.');
                    }
                } catch (error) {
                    console.error('Error deleting slot:', error);
                    alert('Server error occurred.');
                }
            });
        });
    }

    function renderPagination(totalPages, currentPageParam) {
        // Clear the existing pagination buttons
        paginationContainer.innerHTML = '';
    
        // Store current page
        let currentPage = currentPageParam;
    
        // Loop through all the pages and create buttons
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.classList.add('page-btn');
    
            // If it's the current page, add the active class
            if (i === currentPage) {
                btn.classList.add('active');
            }
    
            // Add event listener to fetch slots when button is clicked
            btn.addEventListener('click', () => fetchSlots(i));
    
            // Append the button to the pagination container
            paginationContainer.appendChild(btn);
        }
    }

    async function loadDashboardStats() {
        try {
            // Fetch data from the API
            const response = await fetch('http://localhost:8081/api/dashboardStats');
    
            // Check if the response is okay
            if (!response.ok) {
                throw new Error("Failed to fetch dashboard stats. Status: " + response.status);
            }
    
            // Parse the JSON data from the response
            const data = await response.json();
    
            // Check if the necessary properties exist in the response
            if (!data || typeof data.totalUsers === 'undefined' || typeof data.activeSlots === 'undefined' || typeof data.totalBookings === 'undefined' || typeof data.utilization === 'undefined') {
                throw new Error("Incomplete data received.");
            }
    
            // Update the DOM with the received data
            document.getElementById('totalUsers').textContent = data.totalUsers || '0';
            document.getElementById('activeSlots').textContent = data.activeSlots || '0';
            document.getElementById('totalBookings').textContent = data.totalBookings || '0';
            document.getElementById('utilization').textContent = data.utilization || '0';
            
        } catch (error) {
            // Log the error for debugging purposes
            console.error('Error loading dashboard stats:', error);
    
            // Set the error message in the DOM
            document.getElementById('totalUsers').textContent = 'Error';
            document.getElementById('activeSlots').textContent = 'Error';
            document.getElementById('totalBookings').textContent = 'Error';
            document.getElementById('utilization').textContent = 'Error';
        }
    }

    loadDashboardStats();


});
