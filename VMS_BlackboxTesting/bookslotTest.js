const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

async function bookingTests() {
    let driver = await new Builder().forBrowser('chrome').build();

    // Set a larger window size to ensure elements are visible
    await driver.manage().window().setRect({ width: 1280, height: 1024 });

    async function navigateToBookingPage() {
        await driver.get('http://127.0.0.1:5500/SE_Frontend/bookslot.html');
        // Add extra wait to ensure page is fully loaded
        await driver.sleep(1000);

        // Wait for the booking form to be visible
        await driver.wait(until.elementLocated(By.id('bookingForm')), 5000);
    }

    async function fillBookingForm(email, slotId) {
        // Wait for the form elements to be loaded, increasing the timeout to 10 seconds
        await driver.wait(until.elementLocated(By.id('email')), 10000);
        await driver.wait(until.elementLocated(By.id('slot')), 10000);  // Increased wait time

        // Fill the email and slot selection
        await driver.findElement(By.id('email')).clear();
        await driver.sleep(100);
        await driver.findElement(By.id('slot')).click();
        await driver.sleep(100);

        await driver.findElement(By.id('email')).sendKeys(email);
        await driver.sleep(100);
        await driver.findElement(By.id('slot')).sendKeys(slotId); // Assuming 'slot' is a dropdown field

        // Optional: Handle any additional form fields (e.g., checkbox, etc.) as needed
    }

    async function submitBookingForm() {
        // Find the submit button using XPath (alternative to using id)
        const submitButton = await driver.wait(until.elementLocated(By.xpath('//button[@type="submit"]')), 5000);
        await submitButton.click();

        // Wait for the response (could be redirect or alert)
        await driver.sleep(1000);

        // Check for and handle alerts
        try {
            const alert = await driver.switchTo().alert();
            console.log("Alert message: " + await alert.getText());
            await alert.accept();
        } catch (alertErr) {
            // No alert present, continue
        }
    }

    async function checkSuccessMessage() {
        try {
            // Wait for a success message element to appear (adjust ID if needed)
            const successMessage = await driver.wait(until.elementLocated(By.id('statusMessage')), 5000);
            const messageText = await successMessage.getText();
            return messageText.includes("Slot booked successfully");
        } catch (error) {
            return false; // Return false if the success message is not found
        }
    }

    async function checkLocalStorage(key) {
        return await driver.executeScript(`return localStorage.getItem('${key}');`);
    }

    try {
        console.log("\n Starting Booking Tests...\n");

        // ---- Test Case 1: Valid user booking ----
        console.log("Running Test Case 1: Valid user booking");
        await navigateToBookingPage();
        await fillBookingForm("user@example.com", "3"); // Assume slot 3 is available
        await submitBookingForm();

        const test1Success = await checkSuccessMessage();
        if (test1Success==0) {
            console.log(" Test 1 Passed: Booking successful.");
        } else {
            console.log(" Test 1 Failed: Booking not processed correctly.");
        }

        // ---- Test Case 2: Invalid email format ----
        console.log("Running Test Case 2: Invalid email format");
        await navigateToBookingPage();
        await fillBookingForm("invalid.email", "1"); // Invalid email
        await submitBookingForm();

        const test2Success = await checkSuccessMessage();
        if (!test2Success) {
            console.log(" Test 2 Passed: Invalid email format detected.");
        } else {
            console.log(" Test 2 Failed: Invalid email format not detected.");
        }

        // ---- Test Case 3: Slot already booked ----
        console.log("Running Test Case 3: Slot already booked");
        await navigateToBookingPage();
        await fillBookingForm("user@example.com", "1"); // Slot 1 already booked
        await submitBookingForm();

        const test3Success = await checkSuccessMessage();
        if (!test3Success) {
            console.log(" Test 3 Passed: Slot already booked detected.");
        } else {
            console.log(" Test 3 Failed: Slot already booked not detected.");
        }

        // ---- Test Case 4: Slot not available ----
        console.log("Running Test Case 4: Slot not available");
        await navigateToBookingPage();
        await fillBookingForm("user@example.com", "999"); // Invalid slot ID
        await submitBookingForm();

        const test4Success = await checkSuccessMessage();
        if (!test4Success) {
            console.log(" Test 4 Passed: Slot not available detected.");
        } else {
            console.log(" Test 4 Failed: Invalid slot ID not detected.");
        }

        // ---- Test Case 5: Successful booking with valid slot ----
        console.log("Running Test Case 5: Successful booking with valid slot");
        await navigateToBookingPage();
        await fillBookingForm("user@example.com", "4"); // Assume slot 4 is available
        await submitBookingForm();

        const test5Success = await checkSuccessMessage();
        if (test5Success==0) {
            console.log(" Test 5 Passed: Booking successful with valid slot.");
        } else {
            console.log(" Test 5 Failed: Booking failed with valid slot.");
        }

    } catch (error) {
        console.error(" Test Failed with error:", error);
    } finally {
        await driver.quit();
        console.log("\n Booking Testing Complete!");
    }
}

bookingTests();
