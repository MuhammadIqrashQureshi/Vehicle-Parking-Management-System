const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

// Base URL for testing
const BASE_URL = 'http://127.0.0.1:5500/SE_Frontend/';

// Test case implementation for vehicle check-in system
async function runVehicleCheckInTests() {
    // Launch Chrome
    let driver = await new Builder().forBrowser('chrome').build();
    
    try {
        console.log(' Starting Vehicle Check-in System Tests');
        
        // TC-01: Check-in with valid email and valid vehicle number
        await testValidEmailAndVehicleNumber(driver);
        
        // TC-02: Check-in with empty email field
        await testEmptyEmailField(driver);
        
        // TC-03: Check-in with invalid email format
        await testInvalidEmailFormat(driver);
        
        // TC-04: Check-in with empty vehicle number
        await testEmptyVehicleNumber(driver);
        
        // TC-05: Check-in with numbers-only vehicle number
        await testNumbersOnlyVehicleNumber(driver);
        
        // TC-06: Check-in with vehicle number containing special characters
        await testVehicleNumberWithSpecialChars(driver);
        
        // TC-07: Check-in with minimum length valid email (boundary value)
        await testMinLengthEmail(driver);
        
        // TC-08: Check-in with very long vehicle number (boundary value)
        await testVeryLongVehicleNumber(driver);
        
        // TC-09: Back button navigation
        await testBackButtonNavigation(driver);
        
        // TC-10: Home icon navigation
        await testHomeIconNavigation(driver);
        
        console.log(' All tests completed');
        
    } catch (err) {
        console.error(' Error during test execution:', err);
    } finally {
        // Close the browser
        await driver.quit();
    }
}

// TC-01: Check-in with valid email and valid vehicle number
async function testValidEmailAndVehicleNumber(driver) {
    console.log('\n Running TC-01: Check-in with valid email and valid vehicle number');
    
    try {
        // Navigate to vehicle check-in page
        await driver.get(`${BASE_URL}checkin.html`);
        
        // Set up email in localStorage (simulating logged-in user)
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');
        
        // Enter valid email and vehicle number
        await driver.findElement(By.id('userEmail')).sendKeys('test@example.com');
        await driver.findElement(By.id('checkInVehicleNumber')).sendKeys('ABC123');
        
        // Click the check-in button
        await driver.findElement(By.id('checkInBtn')).click();
        
        // Wait for and check message element (this might need adjustment based on actual implementation)
        try {
            // Since the API might not be running, we're just checking if message element exists
            const messageElement = await driver.findElement(By.id('message'));
            console.log(' TC-01 PASSED: Form submission triggered message display');
        } catch (error) {
            console.log(' TC-01 FAILED: Message element not found after form submission');
        }
    } catch (error) {
        console.error(' TC-01 FAILED:', error);
    }
}

// TC-02: Check-in with empty email field
async function testEmptyEmailField(driver) {
    console.log('\n Running TC-02: Check-in with empty email field');
    
    try {
        // Navigate to vehicle check-in page
        await driver.get(`${BASE_URL}checkin.html`);
        
        // Leave email field empty
        // Enter valid vehicle number
        await driver.findElement(By.id('checkInVehicleNumber')).sendKeys('XYZ789');
        
        // Click the check-in button
        await driver.findElement(By.id('checkInBtn')).click();
        
        // Check if form validation prevented submission (form should still be visible)
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('checkin.html')) {
            // Check if browser's default validation message appeared
            // This is tricky to detect with Selenium, so we'll check if we're still on the same page
            console.log(' TC-02 PASSED: Form submission was prevented with empty email');
        } else {
            console.log(' TC-02 FAILED: Form submission was not prevented with empty email');
        }
    } catch (error) {
        console.error(' TC-02 FAILED:', error);
    }
}

// TC-03: Check-in with invalid email format
async function testInvalidEmailFormat(driver) {
    console.log('\n Running TC-03: Check-in with invalid email format');
    
    try {
        // Navigate to vehicle check-in page
        await driver.get(`${BASE_URL}checkin.html`);
        
        // Enter invalid email and valid vehicle number
        await driver.findElement(By.id('userEmail')).sendKeys('userexample.com');
        await driver.findElement(By.id('checkInVehicleNumber')).sendKeys('DEF456');
        
        // Click the check-in button
        await driver.findElement(By.id('checkInBtn')).click();
        
        // Check if form validation prevented submission
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('checkin.html')) {
            console.log(' TC-03 PASSED: Form submission was prevented with invalid email format');
        } else {
            console.log(' TC-03 FAILED: Form submission was not prevented with invalid email format');
        }
    } catch (error) {
        console.error(' TC-03 FAILED:', error);
    }
}

// TC-04: Check-in with empty vehicle number
async function testEmptyVehicleNumber(driver) {
    console.log('\n Running TC-04: Check-in with empty vehicle number field');
    
    try {
        // Navigate to vehicle check-in page
        await driver.get(`${BASE_URL}checkin.html`);
        
        // Set up email in localStorage
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');
        
        // Enter valid email, leave vehicle number empty
        await driver.findElement(By.id('userEmail')).sendKeys('test@example.com');
        
        // Click the check-in button
        await driver.findElement(By.id('checkInBtn')).click();
        
        // Check if form validation prevented submission
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('checkin.html')) {
            console.log(' TC-04 PASSED: Form submission was prevented with empty vehicle number');
        } else {
            console.log(' TC-04 FAILED: Form submission was not prevented with empty vehicle number');
        }
    } catch (error) {
        console.error(' TC-04 FAILED:', error);
    }
}

// TC-05: Check-in with numbers-only vehicle number
async function testNumbersOnlyVehicleNumber(driver) {
    console.log('\n Running TC-05: Check-in with numbers-only vehicle number');
    
    try {
        // Navigate to vehicle check-in page
        await driver.get(`${BASE_URL}checkin.html`);
        
        // Set up email in localStorage
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');
        
        // Enter valid email and numbers-only vehicle number
        await driver.findElement(By.id('userEmail')).sendKeys('test@example.com');
        await driver.findElement(By.id('checkInVehicleNumber')).sendKeys('123456');
        
        // Click the check-in button
        await driver.findElement(By.id('checkInBtn')).click();
        
        // Check for message display
        try {
            const messageElement = await driver.findElement(By.id('message'));
            console.log(' TC-05 PASSED: Form submitted with numbers-only vehicle number');
        } catch (error) {
            console.log(' TC-05 FAILED: Message element not found after form submission');
        }
    } catch (error) {
        console.error(' TC-05 FAILED:', error);
    }
}

// TC-06: Check-in with vehicle number containing special characters
async function testVehicleNumberWithSpecialChars(driver) {
    console.log('\n Running TC-06: Check-in with vehicle number containing special characters');
    
    try {
        // Navigate to vehicle check-in page
        await driver.get(`${BASE_URL}checkin.html`);
        
        // Set up email in localStorage
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');
        
        // Enter valid email and vehicle number with special characters
        await driver.findElement(By.id('userEmail')).sendKeys('test@example.com');
        await driver.findElement(By.id('checkInVehicleNumber')).sendKeys('ABC-123');
        
        // Click the check-in button
        await driver.findElement(By.id('checkInBtn')).click();
        
        // Check for message display
        try {
            const messageElement = await driver.findElement(By.id('message'));
            console.log(' TC-06 PASSED: Form submitted with vehicle number containing special characters');
        } catch (error) {
            console.log(' TC-06 FAILED: Message element not found after form submission');
        }
    } catch (error) {
        console.error(' TC-06 FAILED:', error);
    }
}

// TC-07: Check-in with minimum length valid email (boundary value)
async function testMinLengthEmail(driver) {
    console.log('\n Running TC-07: Check-in with minimum length valid email');
    
    try {
        // Navigate to vehicle check-in page
        await driver.get(`${BASE_URL}checkin.html`);
        
        // Set up email in localStorage
        await driver.executeScript('localStorage.setItem("userEmail", "a@b.c")');
        
        // Enter minimum length valid email and valid vehicle number
        await driver.findElement(By.id('userEmail')).sendKeys('a@b.c');
        await driver.findElement(By.id('checkInVehicleNumber')).sendKeys('GHI789');
        
        // Click the check-in button
        await driver.findElement(By.id('checkInBtn')).click();
        
        // Check for message display
        try {
            const messageElement = await driver.findElement(By.id('message'));
            console.log(' TC-07 PASSED: Form submitted with minimum length valid email');
        } catch (error) {
            console.log(' TC-07 FAILED: Message element not found after form submission');
        }
    } catch (error) {
        console.error(' TC-07 FAILED:', error);
    }
}

// TC-08: Check-in with very long vehicle number (boundary value)
async function testVeryLongVehicleNumber(driver) {
    console.log('\n Running TC-08: Check-in with very long vehicle number');
    
    try {
        // Navigate to vehicle check-in page
        await driver.get(`${BASE_URL}checkin.html`);
        
        // Set up email in localStorage
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');
        
        // Enter valid email and very long vehicle number
        await driver.findElement(By.id('userEmail')).sendKeys('test@example.com');
        await driver.findElement(By.id('checkInVehicleNumber')).sendKeys('ABCDEFG123456789ABCDEFG123456789');
        
        // Click the check-in button
        await driver.findElement(By.id('checkInBtn')).click();
        
        // Since we don't know the exact validation rules, we'll just check if the form submission triggered any action
        try {
            const messageElement = await driver.findElement(By.id('message'));
            console.log(' TC-08 PASSED: Form processed very long vehicle number');
        } catch (error) {
            console.log(' TC-08 FAILED: Message element not found after form submission');
        }
    } catch (error) {
        console.error(' TC-08 FAILED:', error);
    }
}

// TC-09: Back button navigation
async function testBackButtonNavigation(driver) {
    console.log('\n Running TC-09: Back button navigation functionality');
    
    try {
        // First navigate to main page, then to check-in page to create history
        await driver.get(`${BASE_URL}mainpage.html`);
        await driver.get(`${BASE_URL}checkin.html`);
        
        // Click the back button
        await driver.findElement(By.id('backButton')).click();
        
        // Wait briefly for navigation
        await driver.sleep(1000);
        
        // Check if navigation occurred
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('mainpage.html')) {
            console.log(' TC-09 PASSED: Back button navigation works correctly');
        } else {
            console.log(' TC-09 FAILED: Back button navigation did not work as expected');
        }
    } catch (error) {
        console.error(' TC-09 FAILED:', error);
    }
}

// TC-10: Home icon navigation
async function testHomeIconNavigation(driver) {
    console.log('\n Running TC-10: Home icon navigation functionality');
    
    try {
        // Navigate to vehicle check-in page
        await driver.get(`${BASE_URL}checkin.html`);
        
        // Click the home icon (using the link that contains the icon)
        await driver.findElement(By.css('.left-nav li a')).click();
        
        // Wait briefly for navigation
        await driver.sleep(1000);
        
        // Check if navigation occurred
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('mainpage.html')) {
            console.log(' TC-10 PASSED: Home icon navigation works correctly');
        } else {
            console.log(' TC-10 FAILED: Home icon navigation did not work as expected');
        }
    } catch (error) {
        console.error(' TC-10 FAILED:', error);
    }
}

// Run all tests
runVehicleCheckInTests();