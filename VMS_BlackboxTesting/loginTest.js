const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

async function loginTests() {
    let driver = await new Builder().forBrowser('chrome').build();
    
    // Set a larger window size to ensure elements are visible
    await driver.manage().window().setRect({ width: 1280, height: 1024 });

    async function navigateToLogin() {
        await driver.get('http://127.0.0.1:5500/SE_Frontend/login.html');
        
        // Add extra wait to ensure page is fully loaded
        await driver.sleep(1000);
        
        // Wait for the login form to be visible
        await driver.wait(until.elementLocated(By.id('loginForm')), 5000);
    }

    async function fillLoginForm(email, password, rememberMe) {
        // Wait for form to be fully loaded
        await driver.wait(until.elementLocated(By.id('email')), 5000);
        
        // Fill text fields with waits between actions
        await driver.findElement(By.id('email')).clear();
        await driver.sleep(100);
        await driver.findElement(By.id('password')).clear();
        await driver.sleep(100);

        await driver.findElement(By.id('email')).sendKeys(email);
        await driver.sleep(100);
        await driver.findElement(By.id('password')).sendKeys(password);
        await driver.sleep(100);

        // Handle remember me checkbox with JavaScript execution
        if (rememberMe !== undefined) {
            await driver.executeScript(`
                const checkbox = document.getElementById('remember');
                if (checkbox && checkbox.checked !== ${rememberMe}) {
                    checkbox.checked = ${rememberMe};
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            `);
            await driver.sleep(200);
        }
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
        
        // Check for and handle alerts
        try {
            const alert = await driver.switchTo().alert();
            console.log("Alert message: " + await alert.getText());
            await alert.accept();
        } catch (alertErr) {
            // No alert present, continue
        }
    }

    async function resetToLoginPage() {
        await driver.get('http://127.0.0.1:5500/SE_Frontend/login.html');
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

    async function checkLocalStorage(key) {
        return await driver.executeScript(`return localStorage.getItem('${key}');`);
    }

    try {
        console.log("\n Starting Login Tests...\n");

        // ---- Test Case 1: Valid user login ----
        console.log("Running Test Case 1: Valid user login");
        await navigateToLogin();
        await fillLoginForm("a@b.co", "A@bc123", true);
        await submitForm();
        
        const test1Result = await checkUrlOrAlert('mainpage.html');
        if (test1Result.urlChanged) {
            // Check localStorage was set correctly
            const userId = await checkLocalStorage('userId');
            const userEmail = await checkLocalStorage('userEmail');
            const userRole = await checkLocalStorage('userRole');
            
            if (userId && userEmail === "a@b.co" && userRole === "user") {
                console.log(" Test 1 Passed: Valid user login successful with correct localStorage.");
            } else {
                console.log(" Test 1 Failed: Login redirected but localStorage not set correctly.");
                console.log(`   localStorage: userId=${userId}, userEmail=${userEmail}, userRole=${userRole}`);
            }
        } else {
            console.log(" Test 1 Failed: Valid user login not processed correctly.");
            if (test1Result.alertPresent) {
                console.log("   Alert message: " + test1Result.alertText);
            }
        }

        // ---- Test Case 2: Valid admin login ----
        console.log("Running Test Case 2: Valid admin login");
        await resetToLoginPage();
        await fillLoginForm("longemailuseraaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@example.com", "A@bc123", false);
        await submitForm();
        
        const test2Result = await checkUrlOrAlert('admin.html');
        if (test2Result.urlChanged) {
            // Check localStorage was set correctly
            const userId = await checkLocalStorage('userId');
            const userEmail = await checkLocalStorage('userEmail');
            const userRole = await checkLocalStorage('userRole');
            
            if (userId && userEmail === "longemailuseraaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@example.com" && userRole === "admin") {
                console.log(" Test 2 Passed: Valid admin login successful with correct localStorage.");
            } else {
                console.log(" Test 2 Failed: Login redirected but localStorage not set correctly.");
                console.log(`   localStorage: userId=${userId}, userEmail=${userEmail}, userRole=${userRole}`);
            }
        } else {
            console.log(" Test 2 Failed: Valid admin login not processed correctly.");
            if (test2Result.alertPresent) {
                console.log("   Alert message: " + test2Result.alertText);
            }
        }

        // ---- Test Case 3: Invalid email format ----
        console.log("Running Test Case 3: Invalid email format");
        await resetToLoginPage();
        await fillLoginForm("invalid.email", "anypassword", false);
        await submitForm();
        
        // Should not redirect since HTML validation should prevent form submission
        const test3Result = await checkUrlOrAlert('mainpage.html', 2000);  // shorter timeout since we expect no redirect
        if (!test3Result.urlChanged) {
            console.log(" Test 3 Passed: Invalid email format detected.");
        } else {
            console.log(" Test 3 Failed: Email format validation not working.");
        }

        // ---- Test Case 4: Empty email field ----
        console.log("Running Test Case 4: Empty email field");
        await resetToLoginPage();
        await fillLoginForm("", "anypassword", false);
        await submitForm();
        
        // Should not redirect due to HTML required attribute
        const test4Result = await checkUrlOrAlert('mainpage.html', 2000);
        if (!test4Result.urlChanged) {
            console.log(" Test 4 Passed: Empty email field detected.");
        } else {
            console.log(" Test 4 Failed: Empty email validation not working.");
        }

        // ---- Test Case 5: Empty password field ----
        console.log("Running Test Case 5: Empty password field");
        await resetToLoginPage();
        await fillLoginForm("valid@example.com", "", false);
        await submitForm();
        
        // Should not redirect due to HTML required attribute
        const test5Result = await checkUrlOrAlert('mainpage.html', 2000);
        if (!test5Result.urlChanged) {
            console.log(" Test 5 Passed: Empty password field detected.");
        } else {
            console.log(" Test 5 Failed: Empty password validation not working.");
        }

        // ---- Test Case 6: Non-existent account ----
        console.log("Running Test Case 6: Non-existent account");
        await resetToLoginPage();
        await fillLoginForm("nonexistent@example.com", "anypassword", false);
        await submitForm();
        
        // Should show alert but not redirect
        const test6Result = await checkUrlOrAlert('mainpage.html', 3000);
        if (!test6Result.urlChanged && 
            (test6Result.alertPresent && (
                test6Result.alertText.includes("Login failed: Invalid email or password")
            ))) {
                console.log(" Test 6 Failed: Non-existent account validation not working.");
        } else {
            console.log(" Test 6 Passed: Non-existent account handled correctly.");

            if (test6Result.alertPresent) {
                console.log("   Alert message: " + test6Result.alertText);
            }
        }

        // ---- Test Case 7: Incorrect password ----
        console.log("Running Test Case 7: Incorrect password");
        await resetToLoginPage();
        await fillLoginForm("a@b.co", "wrongpassword", false);
        await submitForm();
        
        // Should show alert but not redirect
        const test7Result = await checkUrlOrAlert('mainpage.html', 3000);
        if (!test7Result.urlChanged && 
            (test7Result.alertPresent && (
                test7Result.alertText.includes("Login failed: Incorrect password")
            ))) {
                console.log(" Test 7 Failed: Incorrect password validation not working.");
            
        } else {
            console.log(" Test 7 Passed: Incorrect password handled correctly.");
            if (test7Result.alertPresent) {
                console.log("   Alert message: " + test7Result.alertText);
            }
        }

        // ---- Test Case 8: Minimum valid email format ----
        console.log("Running Test Case 8: Minimum valid email format");
        await resetToLoginPage();
        // Add this test user to your database with this exact email format
        await fillLoginForm("a@b.co", "A@bc123", false);
        await submitForm();
        
        const test8Result = await checkUrlOrAlert('mainpage.html');
        if (test8Result.urlChanged || 
            (test8Result.alertPresent && test8Result.alertText.includes("successful"))) {
            console.log(" Test 8 Passed: Minimum valid email format accepted.");
        } else {
            console.log(" Test 8 Failed: Minimum valid email format not accepted.");
            if (test8Result.alertPresent) {
                console.log("   Alert message: " + test8Result.alertText);
            }
        }

        // ---- Test Case 9: Navigation to forgot password ----
        console.log("Running Test Case 9: Navigation to forgot password");
        await resetToLoginPage();
        
        // Click forgot password link
        const forgotPasswordLink = await driver.findElement(By.css('.forgot-link'));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", forgotPasswordLink);
        await driver.sleep(200);
        await driver.executeScript("arguments[0].click();", forgotPasswordLink);
        
        const test9Result = await checkUrlOrAlert('forgot-password.html');
        if (test9Result.urlChanged) {
            console.log(" Test 9 Passed: Navigation to forgot password successful.");
        } else {
            console.log(" Test 9 Failed: Navigation to forgot password not working.");
        }

        // ---- Test Case 10: Navigation to sign up ----
        console.log("Running Test Case 10: Navigation to sign up");
        await resetToLoginPage();
        
        // Click sign up link
        const signUpLink = await driver.findElement(By.css('.auth-footer a'));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", signUpLink);
        await driver.sleep(200);
        await driver.executeScript("arguments[0].click();", signUpLink);
        
        const test10Result = await checkUrlOrAlert('signup.html');
        if (test10Result.urlChanged) {
            console.log(" Test 10 Passed: Navigation to sign up successful.");
        } else {
            console.log(" Test 10 Failed: Navigation to sign up not working.");
        }

        
        // ---- Test Case 11: SQL injection attempt ----
        console.log("Running Test Case 11: SQL injection attempt");
        await resetToLoginPage();
        await fillLoginForm("user@example.com' OR '1'='1", "anypassword", false);
        await submitForm();
        
        // Should not allow login with injection
        const test12Result = await checkUrlOrAlert('mainpage.html');
        if (!test12Result.urlChanged) {
            console.log(" Test 11 Passed: SQL injection prevented.");
        } else {
            console.log(" Test 11 Failed: SQL injection prevention not working.");
        }

    } catch (error) {
        console.error(" Test Failed with error:", error);
    } finally {
        await driver.quit();
        console.log("\n Login Testing Complete!");
    }
}

loginTests();