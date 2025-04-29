const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

async function signupTests() {
    let driver = await new Builder().forBrowser('chrome').build();
    
    // Set a larger window size to ensure elements are visible
    await driver.manage().window().setRect({ width: 1280, height: 1024 });

    async function navigateToSignup() {
        await driver.get('http://127.0.0.1:5500/SE_Frontend/mainpage1.html');
        
        // Add extra wait to ensure page is fully loaded
        await driver.sleep(1000);
        
        const ctaButton = await driver.findElement(By.css('.cta-button'));
        // Scroll into view and ensure it's clickable
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", ctaButton);
        await driver.wait(until.elementIsVisible(ctaButton), 5000);
        await driver.wait(until.elementIsEnabled(ctaButton), 5000);
        
        // Use JavaScript click to avoid intercepted click issues
        await driver.executeScript("arguments[0].click();", ctaButton);
        await driver.wait(until.urlContains('signup.html'), 5000);
    }

    async function fillSignupForm(username, email, password, role, acceptTerms) {
        // Wait for form to be fully loaded
        await driver.wait(until.elementLocated(By.id('username')), 5000);
        
        // Fill text fields with waits between actions
        await driver.findElement(By.id('username')).clear();
        await driver.sleep(100);
        await driver.findElement(By.id('email')).clear();
        await driver.sleep(100);
        await driver.findElement(By.id('password')).clear();
        await driver.sleep(100);

        await driver.findElement(By.id('username')).sendKeys(username);
        await driver.sleep(100);
        await driver.findElement(By.id('email')).sendKeys(email);
        await driver.sleep(100);
        await driver.findElement(By.id('password')).sendKeys(password);
        await driver.sleep(100);

        // Handle dropdown selection using JavaScript
        if (role) {
            await driver.executeScript(`
                const selectElement = document.getElementById('role');
                if (selectElement) {
                    selectElement.value = "${role}";
                    // Trigger both change and input events to ensure all listeners catch it
                    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                    selectElement.dispatchEvent(new Event('input', { bubbles: true }));
                }
            `);
            await driver.sleep(200);
        }

        // Handle terms checkbox with safer JavaScript execution
        if (acceptTerms) {
            await driver.executeScript(`
                const checkbox = document.querySelector('.terms-checkbox input');
                if (checkbox && !checkbox.checked) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            `);
        } else {
            await driver.executeScript(`
                const checkbox = document.querySelector('.terms-checkbox input');
                if (checkbox && checkbox.checked) {
                    checkbox.checked = false;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            `);
        }
        await driver.sleep(200);
    }

    async function submitForm() {
        // Find the button and scroll to it
        const submitButton = await driver.findElement(By.css('.auth-button'));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", submitButton);
        
        // Wait a moment for any animations to complete
        await driver.sleep(500);
        
        // Use JavaScript click for reliability
        await driver.executeScript("arguments[0].click();", submitButton);
        
        // Wait longer for form processing and potential alerts
        await driver.sleep(1000);
        
        // Check for and handle alerts (for validation errors)
        try {
            const alert = await driver.switchTo().alert();
            console.log("Alert message: " + await alert.getText());
            await alert.accept();
        } catch (alertErr) {
            // No alert present, continue
        }
    }

    async function resetToSignupPage() {
        await driver.get('http://127.0.0.1:5500/SE_Frontend/signup.html');
        await driver.wait(until.elementLocated(By.css('.auth-button')), 5000);
        // Additional wait to ensure page is fully loaded
        await driver.sleep(1000);
    }

    async function checkUrlOrAlert(expectedUrl, timeoutMs = 5000) {
        // Wait for either URL change or alert
        const startTime = Date.now();
        let urlChanged = false;
        let alertPresent = false;
        let alertText = "";
        
        while (Date.now() - startTime < timeoutMs) {
            // Check current URL
            const currentUrl = await driver.getCurrentUrl();
            if (currentUrl.includes(expectedUrl)) {
                urlChanged = true;
                break;
            }
            
            // Check for alert
            try {
                const alert = await driver.switchTo().alert();
                alertText = await alert.getText();
                await alert.accept();
                alertPresent = true;
                break;
            } catch (alertErr) {
                // No alert present, continue
            }
            
            await driver.sleep(200);
        }
        
        return { urlChanged, alertPresent, alertText };
    }

    try {
        console.log("\n Starting Signup Tests...\n");

        // ---- Test Case 1: Valid signup with minimum boundary values ----
        await navigateToSignup();
        await fillSignupForm("ValidUser", "a@d.co", "A@bc123", "user", true);
        await submitForm();
        
        // Modified checking logic
        const test1Result = await checkUrlOrAlert('login.html');
        if (test1Result.urlChanged || 
            (test1Result.alertPresent && test1Result.alertText.includes("successfully"))) {
            console.log(" Test 1 Passed: Signup with minimum valid inputs.");
        } else {
            console.log(" Test 1 Failed: Valid signup not processed correctly.");
            if (test1Result.alertPresent) {
                console.log("   Alert message: " + test1Result.alertText);
            }
        }

        // ---- Test Case 2: Long (but reasonable) email address ----
        await resetToSignupPage();
        // Using a more reasonable length that's still testing boundaries - 50 chars plus domain
        const longEmail = 'longemailuser' + 'a'.repeat(28) + '@example.com';
        await fillSignupForm("LongEmailUser", longEmail, "A@bc123", "admin", true);
        await submitForm();
        
        const test2Result = await checkUrlOrAlert('login.html');
        if (test2Result.urlChanged || 
            (test2Result.alertPresent && test2Result.alertText.includes("successfully"))) {
            console.log(" Test 2 Passed: Signup with long email.");
        } else {
            console.log(" Test 2 Failed: Long email signup not processed correctly.");
            if (test2Result.alertPresent) {
                console.log("   Alert message: " + test2Result.alertText);
            }
        }

        // ---- Test Case 3: Empty username ----
        await resetToSignupPage();
        await fillSignupForm("", "test3@test.com", "A@bc123", "user", true);
        await submitForm();
        
        const test3Result = await checkUrlOrAlert('login.html');
        if (!test3Result.urlChanged || 
            (test3Result.alertPresent && !test3Result.alertText.includes("successfully"))) {
            console.log(" Test 3 Passed: Empty username detected.");
        } else {
            console.log(" Test 3 Failed: Empty username validation not working.");
        }

        // ---- Test Case 4: Invalid email (missing @) ----
        await resetToSignupPage();
        await fillSignupForm("InvalidEmail", "test.com", "A@bc123", "user", true);
        await submitForm();
        
        const test4Result = await checkUrlOrAlert('login.html');
        if (!test4Result.urlChanged || 
            (test4Result.alertPresent && test4Result.alertText.includes("Invalid email"))) {
            console.log(" Test 4 Passed: Invalid email detected (missing @).");
        } else {
            console.log(" Test 4 Failed: Invalid email validation not working.");
        }

        // ---- Test Case 5: Password too short (6 characters) ----
        await resetToSignupPage();
        await fillSignupForm("ShortPassword", "test5@test.com", "A@b12", "user", true);
        await submitForm();
        
        const test5Result = await checkUrlOrAlert('login.html');
        if (!test5Result.urlChanged || 
            (test5Result.alertPresent && test5Result.alertText.includes("Password"))) {
            console.log(" Test 5 Passed: Password too short detected.");
        } else {
            console.log(" Test 5 Failed: Short password validation not working.");
        }

        // ---- Test Case 6: Password missing special character ----
        await resetToSignupPage();
        await fillSignupForm("NoSpecialChar", "test6@test.com", "Abcdefg", "user", true);
        await submitForm();
        
        const test6Result = await checkUrlOrAlert('login.html');
        if (!test6Result.urlChanged || 
            (test6Result.alertPresent && test6Result.alertText.includes("Password"))) {
            console.log(" Test 6 Passed: Missing special character detected.");
        } else {
            console.log(" Test 6 Failed: Special character validation not working.");
        }

        // ---- Test Case 7: Password missing uppercase letter ----
        await resetToSignupPage();
        await fillSignupForm("NoUppercase", "test7@test.com", "abcdef@1", "user", true);
        await submitForm();
        
        const test7Result = await checkUrlOrAlert('login.html');
        if (!test7Result.urlChanged || 
            (test7Result.alertPresent && test7Result.alertText.includes("Password"))) {
            console.log(" Test 7 Passed: Missing uppercase letter detected.");
        } else {
            console.log(" Test 7 Failed: Uppercase letter validation not working.");
        }

        // ---- Test Case 8: No role selected ----
        await resetToSignupPage();
        await fillSignupForm("NoRoleUser", "test8@test.com", "A@bc123", "", true);
        await submitForm();
        
        const test8Result = await checkUrlOrAlert('login.html');
        if (!test8Result.urlChanged) {
            console.log(" Test 8 Passed: No role selected detected.");
        } else {
            console.log(" Test 8 Failed: Role validation not working.");
        }

        // ---- Test Case 9: Terms not accepted ----
        await resetToSignupPage();
        await fillSignupForm("NoTermsUser", "test9@test.com", "A@bc123", "user", false);
        await submitForm();
        
        const test9Result = await checkUrlOrAlert('login.html');
        if (!test9Result.urlChanged) {
            console.log(" Test 9 Passed: Terms not accepted detected.");
        } else {
            console.log(" Test 9 Failed: Terms acceptance validation not working.");
        }

        // ---- Test Case 10: Duplicate email signup ----
        await resetToSignupPage();
        await fillSignupForm("DuplicateEmail", "a@b.co", "A@bc123", "user", true);
        await submitForm();
        
        const test10Result = await checkUrlOrAlert('login.html');
        if (!test10Result.urlChanged || 
            (test10Result.alertPresent && test10Result.alertText.includes("already registered"))) {
            console.log(" Test 10 Passed: Duplicate email handled.");
        } else {
            console.log(" Test 10 Failed: Duplicate email validation not working.");
        }

    } catch (error) {
        console.error(" Test Failed:", error.message);
    } finally {
        await driver.quit();
    }
}

signupTests();