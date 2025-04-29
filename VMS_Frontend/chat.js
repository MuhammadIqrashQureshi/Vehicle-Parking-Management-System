// Configuration for the AI API
const API_CONFIG = {
    apiKey: "dont need it. you can use just for more features. ",
    model: "gemini-2.0-flash",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/"
};

// Backend API base URL
const BACKEND_API_URL = "http://localhost:8081/api";

// DOM elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const suggestionBtns = document.querySelectorAll('.suggestion-btn');

// Flag to track if welcome message has been shown
let welcomeMessageShown = false;

// Initialize the chat
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    sendButton.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserMessage();
        }
    });
    
    // Set up suggestion buttons
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            userInput.value = btn.textContent;
            handleUserMessage();
        });
    });
    
    // Check if chat is empty before showing welcome message
    if (chatMessages.children.length === 0 && !welcomeMessageShown) {
        showWelcomeMessage();
    }
});

// Show welcome message only once
function showWelcomeMessage() {
    if (!welcomeMessageShown) {
        setTimeout(() => {
            appendMessage(
                'assistant', 
                "Hello! Welcome to the Vehicle Management System. I'm your virtual assistant and can help you with bookings, checking in/out vehicles, viewing your reservations, and more. How can I help you today?"
            );
            welcomeMessageShown = true;
        }, 500);
    }
}

// Handle user message submission
function handleUserMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Display user message
    appendMessage('user', message);
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Process the message
    processUserMessage(message);
}

// Process user message and generate response
async function processUserMessage(message) {
    try {
        // First check if it's a vehicle system-specific query
        const systemResponse = await getSystemResponse(message);
        
        if (systemResponse) {
            // It's a VMS-specific query with a predefined or API-based response
            setTimeout(() => {
                appendMessage('assistant', systemResponse);
                hideTypingIndicator();
            }, 1000);
        } else {
            // For general conversation or queries without predefined answers,
            // use the AI API for a more natural response
            const aiResponse = await fetchAIResponse(message);
            appendMessage('assistant', aiResponse);
            hideTypingIndicator();
        }
    } catch (error) {
        console.error("Error processing message:", error);
        appendMessage('assistant', "I'm sorry, but I'm having trouble processing your request. Please try again later.");
        hideTypingIndicator();
    }
}

// Check if message matches specific system functionality and get appropriate response
async function getSystemResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Greetings
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
        return "Hello! How can I assist you with the Vehicle Management System today?";
    }

    // Goodbyes
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
        return "Goodbye! If you need help with the Vehicle Management System later, I'll be here for you!";
    }

    // Help requests
    if (lowerMessage.includes('help') || lowerMessage.includes('need help') || lowerMessage.includes('assist')) {
        return "Of course, I'm here to help! You can ask about booking a vehicle, checking in or out, viewing your bookings, or anything else related to the Vehicle Management System. What do you need assistance with?";
    }

    // How to register
    if (lowerMessage.includes('register') || lowerMessage.includes('sign up') || lowerMessage.includes('create account')) {
        return "To register for the Vehicle Management System:\n\n1. Go to the 'Sign Up' page from the main website\n2. Enter your email address and create a password\n3. Provide any required details (like name or user type)\n4. Submit the registration form\n\nOnce registered, you can log in and start booking vehicles!";
    }

    // Booking a vehicle
    if (lowerMessage.includes('book') && (lowerMessage.includes('vehicle') || lowerMessage.includes('car') || lowerMessage.includes('slot'))) {
        return "To book a vehicle:\n\n1. Click on the 'Book a Slot' button on the main dashboard\n2. Enter your email address (must match your login email)\n3. Select an available time slot from the dropdown menu\n4. Submit the booking form\n\nYou'll receive a confirmation message when your booking is successful.";
    }

    // Check-in process
    if (lowerMessage.includes('check in') && !lowerMessage.includes('my check') || lowerMessage.includes('checkin')) {
        return "To check in a vehicle:\n\n1. Navigate to the 'Vehicle Check-in' page from the main dashboard\n2. Enter the vehicle number in the input field\n3. Submit the form\n\nThe system will automatically record your check-in time and update the vehicle status.";
    }

    // Check-out process
    if (lowerMessage.includes('check out') && !lowerMessage.includes('my check') || lowerMessage.includes('checkout')) {
        return "To check out a vehicle:\n\n1. Go to the 'Vehicle Check-out' page from the dashboard\n2. Enter the vehicle number in the input field\n3. Submit the form\n\nThe system will record the check-out time and update the vehicle's availability status.";
    }

    // Available slots
    if (lowerMessage.includes('available') && 
        (lowerMessage.includes('slot') || lowerMessage.includes('booking') || lowerMessage.includes('time'))) {
        return await fetchAvailableSlots();
    }

    // My bookings
    if ((lowerMessage.includes('my') || lowerMessage.includes('upcoming')) && 
        (lowerMessage.includes('booking') || lowerMessage.includes('reservation'))) {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
            return "Please log in to view your bookings. You can check your bookings by visiting the 'My Bookings' page.";
        }
        return await fetchUserBookings(userEmail);
    }

    // My check-ins
    if (lowerMessage.includes('my') && lowerMessage.includes('check') && lowerMessage.includes('in')) {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
            return "Please log in to view your check-in history.";
        }
        return await fetchUserCheckIns(userEmail);
    }

    // My check-outs
    if (lowerMessage.includes('my') && lowerMessage.includes('check') && lowerMessage.includes('out')) {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
            return "Please log in to view your check-out history.";
        }
        return await fetchUserCheckOuts(userEmail);
    }

    // Password reset or change
    if (lowerMessage.includes('password') && 
        (lowerMessage.includes('reset') || lowerMessage.includes('change') || lowerMessage.includes('forgot'))) {
        return "To reset or change your password:\n\n1. Navigate to the 'Password Reset' page\n2. Select your user type (driver, admin, etc.)\n3. Enter your new password and confirm it\n4. Submit the form\n\nAfter a successful password reset, you'll be redirected to the login page.";
    }

    // About the system (predefined response as fallback due to Gemini API issues)
    if (lowerMessage.includes('about') && 
        (lowerMessage.includes('system') || lowerMessage.includes('platform') || lowerMessage.includes('vms'))) {
        return "The Vehicle Management System (VMS) is a comprehensive platform designed to streamline vehicle booking, tracking, and management. It allows users to reserve vehicles, check them in and out, and monitor their status in real-time. The system is built to optimize vehicle utilization and enhance security within your organization. You can book a vehicle, view your bookings, and manage check-ins and check-outs all from the dashboard.";
    }

    // Return null for other queries to be handled by Gemini AI
    return null;
}

// Fetch available slots from API
async function fetchAvailableSlots() {
    try {
        const response = await fetch(`${BACKEND_API_URL}/slots`);
        const slots = await response.json();
        
        if (slots.length === 0) {
            return "There are currently no available slots for booking.";
        }
        
        let responseText = "Here are the available slots for booking:\n\n";
        
        slots.forEach(slot => {
            responseText += `• ${slot.slot_time} - ${slot.vehicle_details || "Vehicle available"}\n`;
        });
        
        responseText += "\nYou can book a slot by clicking the 'Book a Slot' button on the main dashboard.";
        return responseText;
    } catch (error) {
        console.error("Error fetching available slots:", error);
        return "I'm having trouble retrieving the available slots right now. Please try again later or check the 'Book a Slot' page directly.";
    }
}

// Fetch user's bookings from API
async function fetchUserBookings(email) {
    try {
        const response = await fetch(`${BACKEND_API_URL}/bookings?email=${email}`);
        const bookings = await response.json();
        
        if (bookings.length === 0) {
            return "You don't have any upcoming bookings.";
        }
        
        let responseText = "Here are your upcoming bookings:\n\n";
        
        bookings.forEach(booking => {
            responseText += `• Booking #${booking.id}: ${booking.slot_time || "N/A"}\n`;
            if (booking.booking_time) {
                responseText += `  Booked on: ${booking.booking_time}\n`;
            }
            responseText += "\n";
        });
        
        responseText += "You can view and manage all your bookings in detail on the 'My Bookings' page.";
        return responseText;
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return "I'm having trouble retrieving your bookings right now. Please try again later or check the 'My Bookings' page directly.";
    }
}

// Fetch user's check-in history from API
async function fetchUserCheckIns(email) {
    try {
        const response = await fetch(`${BACKEND_API_URL}/vehicle/checkins?email=${email}`);
        const checkIns = await response.json();
        
        if (checkIns.length === 0) {
            return "You don't have any recorded check-ins.";
        }
        
        let responseText = "Here are your recent check-ins:\n\n";
        
        checkIns.forEach(checkIn => {
            responseText += `• Vehicle #${checkIn.vehicle_number}: Checked in at ${checkIn.checkin_time || "N/A"}\n`;
            responseText += "\n";
        });
        
        return responseText;
    } catch (error) {
        console.error("Error fetching user check-ins:", error);
        return "I'm having trouble retrieving your check-in history right now. Please try again later.";
    }
}

// Fetch user's check-out history from API
async function fetchUserCheckOuts(email) {
    try {
        const response = await fetch(`${BACKEND_API_URL}/vehicle/checkouts?email=${email}`);
        const checkOuts = await response.json();
        
        if (checkOuts.length === 0) {
            return "You don't have any recorded check-outs.";
        }
        
        let responseText = "Here are your recent check-outs:\n\n";
        
        checkOuts.forEach(checkOut => {
            responseText += `• Vehicle #${checkOut.vehicle_number}: Checked out at ${checkOut.checkout_time || "N/A"}\n`;
            responseText += "\n";
        });
        
        return responseText;
    } catch (error) {
        console.error("Error fetching user check-outs:", error);
        return "I'm having trouble retrieving your check-out history right now. Please try again later.";
    }
}

// Fetch response from AI API for conversational interactions
async function fetchAIResponse(query) {
    try {
        // Enhanced context for a more detailed and accurate response
        const context = `
            You are a friendly and helpful AI assistant for a Vehicle Management System (VMS).
            You should respond in a conversational, natural tone while being helpful with both
            vehicle management questions and casual conversation.

            Detailed Information About the Vehicle Management System (VMS):
            - The VMS is a platform designed to streamline vehicle booking, tracking, and management.
            - Users can book vehicles for specific time slots by selecting available slots from a dropdown menu.
            - Users can check in vehicles when picking them up by entering the vehicle number on the 'Vehicle Check-in' page.
            - Users can check out vehicles when returning them by entering the vehicle number on the 'Vehicle Check-out' page.
            - Users can view their booking history on the 'My Bookings' page, which requires them to be logged in.
            - Users can reset their password if needed by navigating to the 'Password Reset' page, selecting their user type, and submitting a new password.
            - The system optimizes vehicle utilization and enhances security within an organization by providing real-time status updates.
            - Key features include booking confirmation messages, real-time vehicle status updates, and a user-friendly dashboard for managing all vehicle-related tasks.

            For specific system questions, provide helpful information but keep it conversational.
            Feel free to engage in casual conversation on any topic, but gently steer back to
            vehicle management when appropriate.

            Keep responses concise but friendly. For system instructions, use clear steps.

            If you don't know specific details about the user or their bookings, suggest they
            check the appropriate page in the system.
        `;
        
        const endpoint = `${API_CONFIG.baseUrl}${API_CONFIG.model}:generateContent`;
        const response = await fetch(`${endpoint}?key=${API_CONFIG.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: context + "\n\nUser message: " + query }]
                }]
            })
        });
        
        const data = await response.json();
        
        // Check if we have a valid response
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            let aiText = data.candidates[0].content.parts[0].text;
            return aiText;
        } else {
            throw new Error("Invalid response structure from AI API");
        }
    } catch (error) {
        console.error("Error fetching AI response:", error);
        return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Can I help you with something related to our vehicle booking system instead?";
    }
}

// Check for existing messages and clear duplicate welcome messages if needed
function cleanupWelcomeMessages() {
    const existingMessages = document.querySelectorAll('.message.assistant');
    
    // If we have more than one assistant message at the start, keep only the latest one
    if (existingMessages.length > 1) {
        // Remove all but the last assistant message that appears before any user message
        let seenUserMessage = false;
        let messagesToRemove = [];
        
        for (let i = 0; i < chatMessages.children.length; i++) {
            const child = chatMessages.children[i];
            
            if (child.classList.contains('message') && child.classList.contains('user')) {
                seenUserMessage = true;
            }
            
            if (!seenUserMessage && child.classList.contains('message') && child.classList.contains('assistant')) {
                messagesToRemove.push(child);
            }
        }
        
        // Keep the last welcome message, remove others
        if (messagesToRemove.length > 1) {
            for (let i = 0; i < messagesToRemove.length - 1; i++) {
                chatMessages.removeChild(messagesToRemove[i]);
            }
        }
    }
}

// Append a message to the chat UI
function appendMessage(role, content) {
    // Clean up any duplicate welcome messages first
    if (role === 'assistant' && !welcomeMessageShown) {
        cleanupWelcomeMessages();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    
    const icon = document.createElement('i');
    icon.className = role === 'user' ? 'fas fa-user' : 'fas fa-robot';
    avatarDiv.appendChild(icon);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Convert newlines to <br> tags
    const formattedContent = content.replace(/\n/g, '<br>');
    contentDiv.innerHTML = `<p>${formattedContent}</p>`;
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to the bottom of the chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Mark welcome message as shown if this is the welcome message
    if (role === 'assistant' && !welcomeMessageShown) {
        welcomeMessageShown = true;
    }
}

// Show typing indicator while waiting for response
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typingIndicator';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-robot';
    avatarDiv.appendChild(icon);
    
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        indicatorDiv.appendChild(dot);
    }
    
    typingDiv.appendChild(avatarDiv);
    typingDiv.appendChild(indicatorDiv);
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide the typing indicator
function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Run cleanup on page load to fix any existing duplicate messages
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        cleanupWelcomeMessages();
    }, 600);
});
