document.addEventListener('DOMContentLoaded', function() {
    // Logout functionality
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            localStorage.removeItem("user");
            window.location.href = "login.html"; 
        });
    }

    // Initial data load
    fetchFeedback();
    
    // Event listeners for filtering
    const feedbackSearch = document.getElementById('feedbackSearch');
    const ratingFilter = document.getElementById('ratingFilter');
    
    if (feedbackSearch) feedbackSearch.addEventListener('input', filterFeedback);
    if (ratingFilter) ratingFilter.addEventListener('change', filterFeedback);
});

async function fetchFeedback() {
    try {
        showLoading(true);
        const response = await fetch('http://localhost:8081/api/getAllFeedback');
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }
        
        const feedbackData = await response.json();
        displayFeedback(feedbackData);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        showError('Error loading feedback data. Please try again.');
    } finally {
        showLoading(false);
    }
}

function displayFeedback(feedbackList) {
    const tableBody = document.getElementById('feedbackTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (!feedbackList || feedbackList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="no-data">
                    <i class="fas fa-info-circle"></i> No feedback records found
                </td>
            </tr>`;
        return;
    }
    
    feedbackList.forEach(feedback => {
        const row = document.createElement('tr');
        row.dataset.rating = feedback.rating; // Store rating as data attribute
        
        // Format the date
        let formattedDate = 'Not available';
        if (feedback.created_at) {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            formattedDate = new Date(feedback.created_at).toLocaleDateString('en-US', options);
        }
        
        // Create star rating display
        const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
        
        row.innerHTML = `
            <td>${feedback.user_email || 'Unknown User'}</td>
            <td>
                <span class="rating-stars">${stars}</span> 
                <span class="rating-value">(${feedback.rating})</span>
            </td>
            <td>${feedback.comments || 'No comments provided'}</td>
            <td>${formattedDate}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function filterFeedback() {
    const searchTerm = (document.getElementById('feedbackSearch')?.value.toLowerCase() || '');
    const ratingFilter = (document.getElementById('ratingFilter')?.value || 'all');
    
    const rows = document.querySelectorAll('#feedbackTableBody tr');
    
    rows.forEach(row => {
        if (row.classList.contains('no-data')) return;
        
        const rating = row.dataset.rating;
        const comment = row.cells[2].textContent.toLowerCase();
        const user = row.cells[0].textContent.toLowerCase();
        
        const matchesSearch = user.includes(searchTerm) || comment.includes(searchTerm);
        const matchesRating = ratingFilter === 'all' || rating === ratingFilter;
        
        row.style.display = (matchesSearch && matchesRating) ? '' : 'none';
    });
}

// Utility functions
function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) loader.style.display = show ? 'block' : 'none';
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert(message);
    }
}