document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logoutBtn");
    const filterDropdown = document.querySelector(".filter-dropdown");
    let charts = {
        activity: null,
        usersSlots: null,
        rates: null,
        utilization: null
    };

    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });

    async function loadDashboardData() {
        try {
            const response = await fetch('http://localhost:8081/api/my-chartStats');
            if (!response.ok) throw new Error("Failed to fetch dashboard stats");
            
            const data = await response.json();
            updateStatsDisplay(data);
            renderCharts(data);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            showErrorState();
        }
    }

    function updateStatsDisplay(data) {
        document.getElementById('totalUsers').textContent = data.totalUsers || '0';
        document.getElementById('activeSlots').textContent = data.activeSlots || '0';
        document.getElementById('totalBookings').textContent = data.totalBookings || '0';
        document.getElementById('utilization').textContent = data.utilization || '0%';
        document.getElementById('growthRate').textContent = data.growthRate || '0%';
        document.getElementById('completionRate').textContent = data.completionRate || '0%';
    }

    function showErrorState() {
        const elements = [
            'totalUsers', 'activeSlots', 'totalBookings', 
            'utilization', 'growthRate', 'completionRate'
        ];
        elements.forEach(id => {
            document.getElementById(id).textContent = 'Error';
        });
    }

    function renderCharts(data) {
        renderUsersSlotsChart(data);
        renderRatesChart(data);
        renderUtilizationChart(data);
    }

    function renderUsersSlotsChart(data) {
        const ctx = document.getElementById('usersSlotsChart').getContext('2d');
        
        if (charts.usersSlots) charts.usersSlots.destroy();
        
        charts.usersSlots = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Users', 'Active Slots', 'Bookings'],
                datasets: [{
                    label: 'Count',
                    data: [
                        parseInt(data.totalUsers) || 0,
                        parseInt(data.activeSlots) || 0,
                        parseInt(data.totalBookings) || 0
                    ],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function renderRatesChart(data) {
        const ctx = document.getElementById('ratesChart').getContext('2d');
        const growthRate = parseFloat(data.growthRate) || 0;
        const completionRate = parseFloat(data.completionRate) || 0;
        
        if (charts.rates) charts.rates.destroy();
        
        charts.rates = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Growth Rate', 'Completion Rate'],
                datasets: [{
                    label: 'Percentage',
                    data: [growthRate, completionRate],
                    backgroundColor: [
                        getRateColor(growthRate),
                        getRateColor(completionRate)
                    ],
                    borderColor: [
                        adjustColor(getRateColor(growthRate), -20),
                        adjustColor(getRateColor(completionRate), -20)
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.raw + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    function renderUtilizationChart(data) {
        const ctx = document.getElementById('utilizationChart').getContext('2d');
        const utilization = parseFloat(data.utilization) || 0;
        const remaining = 100 - utilization;
        
        if (charts.utilization) charts.utilization.destroy();
        
        charts.utilization = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Utilized', 'Available'],
                datasets: [{
                    data: [utilization, remaining],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(201, 203, 207, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(201, 203, 207, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.raw + '%';
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    function getRateColor(value) {
        if (value >= 70) return 'rgba(40, 146, 167, 0.88)'; 
        if (value >= 30) return 'rgba(255, 193, 7, 0.7)'; 
        return 'rgba(220, 53, 69, 0.7)'; 
    }

    function adjustColor(color, amount) {
        return color.replace(/[\d\.]+\)$/, (match) => {
            return (parseFloat(match) + amount + ')');
        });
    }

    // Initialize
    loadDashboardData();
    loadUserActivity();

    // Refresh button
    document.querySelector('.secondary-btn').addEventListener('click', () => {
        loadDashboardData();
        loadUserActivity();
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logoutBtn");

    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
    async function mychartStats() {
        try {
           
            const response = await fetch('http://localhost:8081/api/my-chartStats');
        
            if (!response.ok) {
                throw new Error("Failed to fetch dashboard stats. Status: " + response.status);
            }
        
            const data = await response.json();
    
            if (!data || typeof data.totalUsers === 'undefined' || typeof data.activeSlots === 'undefined' || typeof data.totalBookings === 'undefined' || typeof data.utilization === 'undefined' || typeof data.growthRate === 'undefined' || typeof data.completionRate === 'undefined') {
                throw new Error("Incomplete data received.");
            }
            document.getElementById('totalUsers').textContent = data.totalUsers || '0';
            document.getElementById('activeSlots').textContent = data.activeSlots || '0';
            document.getElementById('totalBookings').textContent = data.totalBookings || '0';
            document.getElementById('utilization').textContent = data.utilization || '0';
            document.getElementById('growthRate').textContent = data.growthRate || '0%';
            document.getElementById('completionRate').textContent = data.completionRate || '0%';
            
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
    
            document.getElementById('totalUsers').textContent = 'Error';
            document.getElementById('activeSlots').textContent = 'Error';
            document.getElementById('totalBookings').textContent = 'Error';
            document.getElementById('utilization').textContent = 'Error';
            
            document.getElementById('growthRate').textContent = 'Error';
            document.getElementById('completionRate').textContent = 'Error';
        }
    }

    const filterDropdown = document.querySelector(".filter-dropdown");
    let chartInstance = null;

    const loadUserActivity = async (range = "month") => {
        try {
            const response = await fetch(`http://localhost:8081/api/user-activity?range=${range}`);
            const result = await response.json();

            const labels = result.map(entry => entry.label);
            const values = result.map(entry => entry.count);

            if (chartInstance) {
                chartInstance.destroy(); // clear previous chart
            }

            const ctx = document.getElementById("activityChart").getContext("2d");
            chartInstance = new Chart(ctx, {
                type: "line",
                data: {
                    labels,
                    datasets: [{
                        label: "Bookings",
                        data: values,
                        backgroundColor: "rgba(77, 157, 224, 0.2)",
                        borderColor: "#4d9de0",
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

        } catch (err) {
            console.error("Error loading user activity chart:", err);
        }
    };

    filterDropdown.addEventListener("change", () => {
        const selectedRange = filterDropdown.value;
        loadUserActivity(selectedRange);
    });

    loadUserActivity();
    /*mychartStats();*/

    document.querySelector('.secondary-btn').addEventListener('click', () => {
        mychartStats();
        loadUserActivity();
    });
    document.querySelector('.primary-btn').addEventListener('click', () => {
        // 1. Export Chart as PNG
        const canvas = document.getElementById('activityChart');
        const image = canvas.toDataURL("image/png");
        const chartLink = document.createElement('a');
        chartLink.href = image;
        chartLink.download = 'user_activity_chart.png';
        chartLink.click();
    
        // 2. Export Stats as CSV
        const stats = {
            "Total Users": document.getElementById("totalUsers").innerText,
            "Active Slots": document.getElementById("activeSlots").innerText,
            "Bookings": document.getElementById("totalBookings").innerText,
            "Utilization": document.getElementById("utilization").innerText,
            "Growth Rate": document.getElementById("growthRate").innerText,
            "Completion Rate": document.getElementById("completionRate").innerText
        };
    
        let csvContent = "data:text/csv;charset=utf-8,Metric,Value\n";
        for (const [key, value] of Object.entries(stats)) {
            csvContent += `${key},${value}\n`;
        }
    
        const encodedUri = encodeURI(csvContent);
        const csvLink = document.createElement("a");
        csvLink.setAttribute("href", encodedUri);
        csvLink.setAttribute("download", "dashboard_stats.csv");
        document.body.appendChild(csvLink);
        csvLink.click();
        document.body.removeChild(csvLink);
    });
    
});
