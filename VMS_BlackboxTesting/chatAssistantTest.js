const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

async function chatAssistantTests() {
    let driver = await new Builder().forBrowser('chrome').build();
    
    // Set a larger window size to ensure elements are visible
    await driver.manage().window().setRect({ width: 1280, height: 1024 });

    // Navigate to the chat page containing the assistant
    async function navigateToChatPage() {
        await driver.get('http://127.0.0.1:5500/SE_Frontend/chat.html');
        // Wait for chat interface to load
        await driver.wait(until.elementLocated(By.id('chatMessages')), 5000);
        // Wait for welcome message to appear
        await driver.sleep(1000); // Give time for the welcome message to show
    }

    // Send a message to the chat assistant
    async function sendMessage(message) {
        // Find the input field and send button
        const inputField = await driver.findElement(By.id('userInput'));
        const sendButton = await driver.findElement(By.id('sendButton'));
        
        // Clear any existing text and type the message
        await inputField.clear();
        await inputField.sendKeys(message);
        
        // Click the send button
        await sendButton.click();
        
        // Wait for response (give enough time for backend/API responses)
        await driver.sleep(2000);
    }

    // Get the latest message from the specified sender
    async function getLatestMessage(sender) {
        // Wait for messages to appear
        await driver.wait(until.elementLocated(By.css(`.message.${sender}`)), 10000);
        
        // Get all messages from the specified sender
        const messages = await driver.findElements(By.css(`.message.${sender}`));
        
        // Get the last (most recent) message
        if (messages.length > 0) {
            return await messages[messages.length - 1].getText();
        }
        
        return null;
    }

    // Check if a specific message from the assistant contains expected text
    async function checkAssistantResponse(expectedTextFragment) {
        const latestMessage = await getLatestMessage('assistant');
        
        if (latestMessage && latestMessage.includes(expectedTextFragment)) {
            return true;
        }
        
        return false;
    }

    try {
        console.log("\n Starting Chat Assistant Tests...\n");

        // ---- Test Case 1: Welcome message appears on page load ----
        console.log("Running Test Case 1: Welcome message on page load");
        await navigateToChatPage();
        
        const welcomeMessageShown = await checkAssistantResponse("Welcome to the Vehicle Management System");
        if (welcomeMessageShown) {
            console.log(" Test 1 Passed: Welcome message displayed correctly.");
        } else {
            console.log(" Test 1 Failed: Welcome message not displayed or incorrect.");
        }

        // ---- Test Case 2: Basic greeting ----
        console.log("Running Test Case 2: Basic greeting");
        await sendMessage("Hello");
        
        const greetingResponse = await checkAssistantResponse("How can I assist you");
        if (greetingResponse) {
            console.log(" Test 2 Passed: Assistant responded to greeting correctly.");
        } else {
            console.log(" Test 2 Failed: Assistant greeting response incorrect or missing.");
        }

        // ---- Test Case 3: Ask about available slots ----
        console.log("Running Test Case 3: Asking about available slots");
        await sendMessage("What slots are available?");
        
        // This will either return actual slot data or a message about being unable to fetch slots
        const slotsResponse = await checkAssistantResponse("available slots") || 
                             await checkAssistantResponse("I'm having trouble retrieving");
        if (slotsResponse) {
            console.log(" Test 3 Passed: Assistant responded to slots query appropriately.");
        } else {
            console.log(" Test 3 Failed: Assistant slots response incorrect or missing.");
        }

        // ---- Test Case 4: Ask about the system ----
        console.log("Running Test Case 6: Asking about the system");
        await sendMessage("Tell me about this system");
        
        const systemInfoResponse = await checkAssistantResponse("Vehicle Management System");
        if (systemInfoResponse) {
            console.log(" Test 4 Passed: Assistant provided system information correctly.");
        } else {
            console.log(" Test 4 Failed: Assistant system information response incorrect or missing.");
        }

        // ---- Test Case 5: Ask about password reset ----
        console.log("Running Test Case 5: Asking about password reset");
        await sendMessage("How do I reset my password?");
        
        const passwordResetResponse = await checkAssistantResponse("reset or change your password");
        if (passwordResetResponse) {
            console.log(" Test 5 Passed: Assistant provided password reset information correctly.");
        } else {
            console.log(" Test 5 Failed: Assistant password reset response incorrect or missing.");
        }

        // ---- Test Case 6: Say goodbye ----
        console.log("Running Test Case 6: Saying goodbye");
        await sendMessage("Goodbye");
        
        const goodbyeResponse = await checkAssistantResponse("Goodbye") || 
                               await checkAssistantResponse("bye");
        if (goodbyeResponse) {
            console.log(" Test 6 Passed: Assistant responded to goodbye correctly.");
        } else {
            console.log(" Test 6 Failed: Assistant goodbye response incorrect or missing.");
        }

        // ---- Test Case 7: Ask about registration ----
        console.log("Running Test Case 7: Asking about registration");
        await sendMessage("How do I register for the system?");
        
        const registrationResponse = await checkAssistantResponse("register for the Vehicle Management System");
        if (registrationResponse) {
            console.log(" Test 7 Passed: Assistant provided registration information correctly.");
        } else {
            console.log(" Test 7 Failed: Assistant registration response incorrect or missing.");
        }

        // ---- Test Case 8: Check help functionality ----
        console.log("Running Test Case 8: Asking for help");
        await sendMessage("I need help");
        
        const helpResponse = await checkAssistantResponse("I'm here to help");
        if (helpResponse) {
            console.log(" Test 8 Passed: Assistant responded to help request correctly.");
        } else {
            console.log(" Test 8 Failed: Assistant help response incorrect or missing.");
        }

        // ---- Test Case 9: Test suggestion button functionality ----
        console.log("Running Test Case 9: Testing suggestion button");
        // Click the first suggestion button
        const suggestionBtn = await driver.findElement(By.css('.suggestion-btn'));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", suggestionBtn);
        await driver.sleep(500);
        await driver.executeScript("arguments[0].click();", suggestionBtn);
        await driver.sleep(2000);
        
        // Check if the message was sent and received a response
        const userMessageSent = await getLatestMessage('user');
        const assistantResponseReceived = await getLatestMessage('assistant');
        
        if (userMessageSent && assistantResponseReceived) {
            console.log(" Test 9 Passed: Suggestion button functionality works correctly.");
        } else {
            console.log(" Test 9 Failed: Suggestion button functionality not working as expected.");
        }

        // ---- Test Case 10: Test non-system query (AI fallback) ----
        console.log("Running Test Case 10: Testing non-system query");
        await sendMessage("Tell me a fun fact about cars");
        
        // Allow extra time for AI response
        await driver.sleep(3000);
        
        const aiResponse = await getLatestMessage('assistant');
        if (aiResponse && aiResponse.length > 20) {  // Simple check for a substantial response
            console.log(" Test 10 Passed: Non-system query handled by AI fallback.");
        } else {
            console.log(" Test 10 Failed: AI fallback not working for non-system queries.");
        }

    } catch (error) {
        console.error(" Test Failed with error:", error);
    } finally {
        await driver.quit();
        console.log("\n Chat Assistant Testing Complete!");
    }
}

chatAssistantTests();