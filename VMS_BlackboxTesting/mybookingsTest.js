const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

// Utility function to run a single test
async function runTest(testName, testFunction) {
    console.log(`\nRunning test: ${testName}`);
    let driver;
    
    try {
        // Setup driver
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().setTimeouts({ implicit: 5000 });
        
        // Run the test
        await testFunction(driver);
        console.log(` PASSED: ${testName}`);
    } catch (error) {
        console.error(` FAILED: ${testName}`);
        console.error(error);
    } finally {
        // Cleanup
        if (driver) {
            await driver.quit();
        }
    }
}

// Test 1: Valid email that matches localStorage
async function testValidEmailMatch() {
    await runTest('Valid email matches localStorage', async (driver) => {
        // Setup test environment
        await driver.get('http://127.0.0.1:5500/SE_Frontend/mybookings.html');
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');
        await driver.navigate().refresh();
        
        // Wait for loader to disappear
        await driver.wait(until.elementLocated(By.id('content')), 2000);
        
        // Use the same email as in localStorage
        await driver.findElement(By.id('email')).sendKeys('test@example.com');
        await driver.findElement(By.id('bookingCheckForm')).submit();
        
        // Mock API response
        await driver.executeScript(`
            window.fetch = function(url) {
                if (url.includes('/api/bookings?email=')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve([
                            {
                                id: 1,
                                slot_time: '2025-05-01 14:00:00',
                                booking_time: '2025-04-25 10:30:00'
                            }
                        ])
                    });
                }
                return Promise.reject('Unexpected fetch call');
            };
        `);
        
        // Wait for results to load (or timeout if error)
        try {
            await driver.wait(async () => {
                const elements = await driver.findElements(By.css('.booking-item, .no-bookings'));
                return elements.length > 0;
            }, 5000, 'Bookings should be displayed after submission');
        } catch (error) {
            throw new Error('Failed to load bookings: ' + error.message);
        }
    });
}

// Test 2: Email input does not match localStorage
async function testEmailMismatch() {
    await runTest('Email does not match logged-in user', async (driver) => {
        // Setup test environment
        await driver.get('http://127.0.0.1:5500/SE_Frontend/mybookings.html');
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');
        await driver.navigate().refresh();
        
        // Wait for loader to disappear
        await driver.wait(until.elementLocated(By.id('content')), 2000);
        
        // Use a different email than localStorage
        await driver.findElement(By.id('email')).sendKeys('different@example.com');
        await driver.findElement(By.id('bookingCheckForm')).submit();
        
        // This should trigger an alert
        try {
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            const alertText = await alert.getText();
            assert(alertText.includes('does not match'), 'Alert should indicate email mismatch');
            await alert.accept();
        } catch (error) {
            throw new Error('Expected alert was not shown: ' + error.message);
        }
    });
}

// Test 3: Empty email input
async function testEmptyEmail() {
    await runTest('Prevent submission with empty email', async (driver) => {
        // Setup test environment
        await driver.get('http://127.0.0.1:5500/SE_Frontend/mybookings.html');
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');
        await driver.navigate().refresh();
        
        // Wait for loader to disappear
        await driver.wait(until.elementLocated(By.id('content')), 2000);
        
        // Try to submit with empty email
        const emailInput = await driver.findElement(By.id('email'));
        const submitButton = await driver.findElement(By.css('#bookingCheckForm button[type="submit"]'));
        
        // Attempt to click the submit button (should be prevented by browser validation)
        await submitButton.click();
        
        // The form should still be active, and we should be able to find the email input
        const formIsVisible = await driver.findElement(By.id('bookingCheckForm')).isDisplayed();
        assert(formIsVisible, 'Form should still be visible after attempting submission with empty email');
    });
}

// Test 4: Invalid email format
async function testInvalidEmailFormat() {
    await runTest('Validate email format', async (driver) => {
        // Setup test environment
        await driver.get('http://127.0.0.1:5500/SE_Frontend/mybookings.html');
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');
        await driver.navigate().refresh();
        
        // Wait for loader to disappear
        await driver.wait(until.elementLocated(By.id('content')), 2000);
        
        // Enter invalid email format
        await driver.findElement(By.id('email')).sendKeys('invalid-email');
        
        // Try to submit
        const submitButton = await driver.findElement(By.css('#bookingCheckForm button[type="submit"]'));
        await submitButton.click();
        
        // Form should still be active since browser should validate email format
        const formIsVisible = await driver.findElement(By.id('bookingCheckForm')).isDisplayed();
        assert(formIsVisible, 'Form should still be visible after attempting submission with invalid email');
    });
}

// Test 5: No localStorage email set
async function testNoUserLoggedIn() {
    await runTest('Handle case when no user is logged in', async (driver) => {
        // Setup test environment
        await driver.get('http://127.0.0.1:5500/SE_Frontend/mybookings.html');
        await driver.executeScript('localStorage.removeItem("userEmail")');
        await driver.navigate().refresh();
        
        // Wait for loader to disappear
        await driver.wait(until.elementLocated(By.id('content')), 2000);
        
        // Try to submit with a valid email
        await driver.findElement(By.id('email')).sendKeys('test@example.com');
        await driver.findElement(By.id('bookingCheckForm')).submit();
        
        // Should show alert about not matching login email
        try {
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            const alertText = await alert.getText();
            assert(alertText.includes('does not match'), 'Alert should indicate no logged-in user');
            await alert.accept();
        } catch (error) {
            throw new Error('Expected alert was not shown: ' + error.message);
        }
    });
}

// Test 6: Maximum length email (boundary value)
async function testMaxLengthEmail() {
    await runTest('Handle maximum length valid email', async (driver) => {
        // Setup test environment
        await driver.get('http://127.0.0.1:5500/SE_Frontend/mybookings.html');
        
        // Generate a long but valid email (just before the boundary)
        const longLocalPart = 'a'.repeat(60);
        const longDomain = 'b'.repeat(60);
        const longEmail = `${longLocalPart}@${longDomain}.com`;
        
        // Set matching email in localStorage
        await driver.executeScript(`localStorage.setItem("userEmail", "${longEmail}")`);
        await driver.navigate().refresh();
        
        // Wait for loader to disappear
        await driver.wait(until.elementLocated(By.id('content')), 2000);
        
        // Submit form with the same long email
        await driver.findElement(By.id('email')).sendKeys(longEmail);
        
        // Mock the fetch API to return test data
        await driver.executeScript(`
            window.fetch = function(url) {
                if (url.includes('/api/bookings?email=')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve([])
                    });
                }
                return Promise.reject('Unexpected fetch call');
            };
        `);
        
        await driver.findElement(By.id('bookingCheckForm')).submit();
        
        // Should not show error alert
        try {
            // Brief wait to see if alert appears for errors
            await driver.wait(until.alertIsPresent(), 1000);
            assert.fail('Alert should not appear for valid maximum length email');
        } catch (error) {
            // Expected - no alert should appear
            const bookingsList = await driver.findElement(By.id('bookingsList'));
            assert(await bookingsList.isDisplayed(), 'Bookings list should be displayed');
        }
    });
}

// Test 7: No bookings found
async function testNoBookingsFound() {
    await runTest('Display message when no bookings found', async (driver) => {
        // Setup test environment
        await driver.get('http://127.0.0.1:5500/SE_Frontend/mybookings.html');
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');
        await driver.navigate().refresh();
        
        // Wait for loader to disappear
        await driver.wait(until.elementLocated(By.id('content')), 2000);
        
        // Mock the fetch API to return empty bookings
        await driver.executeScript(`
            window.fetch = function(url) {
                if (url.includes('/api/bookings?email=')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve([])
                    });
                }
                return Promise.reject('Unexpected fetch call');
            };
        `);
        
        // Submit form
        await driver.findElement(By.id('email')).sendKeys('test@example.com');
        await driver.findElement(By.id('bookingCheckForm')).submit();
        
        // Should display "No bookings found" message
        try {
            await driver.wait(until.elementLocated(By.css('.no-bookings')), 5000);
            const noBookingsMsg = await driver.findElement(By.css('.no-bookings')).getText();
            assert(noBookingsMsg.includes('No bookings'), 'Should display no bookings message');
        } catch (error) {
            throw new Error('No bookings message not displayed: ' + error.message);
        }
    });
}

// Test 8: Verify booking card information
async function testBookingCardDisplay() {
    await runTest('Display correct booking information in cards', async (driver) => {
        // Setup test environment
        await driver.get('http://127.0.0.1:5500/SE_Frontend/mybookings.html');
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');
        await driver.navigate().refresh();
        
        // Wait for loader to disappear
        await driver.wait(until.elementLocated(By.id('content')), 2000);
        
        // Mock the fetch API to return test data
        await driver.executeScript(`
            window.fetch = function(url) {
                if (url.includes('/api/bookings?email=')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve([
                            {
                                id: 1,
                                slot_time: '2025-05-01 14:00:00',
                                booking_time: '2025-04-25 10:30:00'
                            }
                        ])
                    });
                }
                return Promise.reject('Unexpected fetch call');
            };
        `);
        
        // Submit form
        await driver.findElement(By.id('email')).sendKeys('test@example.com');
        await driver.findElement(By.id('bookingCheckForm')).submit();
        
        // Wait for booking card to appear
        await driver.wait(until.elementLocated(By.css('.booking-item')), 5000);
        
        // Check if booking details are shown correctly
        const bookingFront = await driver.findElement(By.css('.booking-card .front'));
        const frontText = await bookingFront.getText();
        
        assert(frontText.includes('Booking ID:'), 'Should display booking ID label');
        assert(frontText.includes('1'), 'Should display correct booking ID');
        assert(frontText.includes('Slot Time:'), 'Should display slot time label');
        assert(frontText.includes('2025-05-01 14:00:00'), 'Should display correct slot time');
    });
}

// Test 9: API error handling for booking retrieval
async function testApiErrorHandling() {
    await runTest('Handle API errors when retrieving bookings', async (driver) => {
        // Setup test environment
        await driver.get('http://127.0.0.1:5500/SE_Frontend/mybookings.html');
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');
        await driver.navigate().refresh();
        
        // Wait for loader to disappear
        await driver.wait(until.elementLocated(By.id('content')), 2000);
        
        // Mock fetch to simulate API error
        await driver.executeScript(`
            window.fetch = function(url) {
                if (url.includes('/api/bookings?email=')) {
                    return Promise.resolve({
                        ok: false,
                        status: 500,
                        json: () => Promise.reject(new Error('Internal server error'))
                    });
                }
                return Promise.reject('Unexpected fetch call');
            };
        `);
        
        // Submit form
        await driver.findElement(By.id('email')).sendKeys('test@example.com');
        await driver.findElement(By.id('bookingCheckForm')).submit();
        
        // Should show alert about API error
        try {
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            const alertText = await alert.getText();
            assert(alertText.includes('Failed to load bookings'), 'Alert should indicate API error');
            await alert.accept();
        } catch (error) {
            throw new Error('Expected error alert was not shown: ' + error.message);
        }
    });
}

// Run all tests
(async function runAllTests() {
    try {
        console.log('Starting MyBookings test suite...');
        
        await testValidEmailMatch();
        await testEmailMismatch();
        await testEmptyEmail();
        await testInvalidEmailFormat();
        await testNoUserLoggedIn();
        await testMaxLengthEmail();
        await testNoBookingsFound();
        await testBookingCardDisplay();
        await testApiErrorHandling();
        
        console.log('\nAll tests completed!');
    } catch (error) {
        console.error('Error running test suite:', error);
    }
})();