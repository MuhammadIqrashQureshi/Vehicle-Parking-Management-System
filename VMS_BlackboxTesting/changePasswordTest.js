const { Builder, By, until } = require('selenium-webdriver');
const mysql = require('mysql2/promise');

// ✅ Your Database Credentials
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'SE_Project'
};

(async function changePasswordBlackBoxTest() {
    // --- Setup MySQL
    const connection = await mysql.createConnection(dbConfig);

    // --- Setup Selenium
    let driver = await new Builder().forBrowser('chrome').build();

    // Test user data
    const testUserEmail = "testuser@example.com";
    const testUserPassword = "OldPassword@123";

    try {
        console.log(' Preparing Database...');

        // Clean up if user exists
        await connection.query('DELETE FROM users WHERE email = ?', [testUserEmail]);

        // Insert test user (no hashing as per request)
        await connection.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", ['testuser', testUserEmail, testUserPassword]);

        // Verify the user creation
        const [rows] = await connection.query("SELECT password FROM users WHERE email = ?", [testUserEmail]);
        console.log("Stored password in database:", rows[0].password);  // Log the stored password

        console.log(' Test user ready.');

        await driver.get('http://127.0.0.1:5500/SE_Frontend/changepassword.html');

        // Remove overlay to prevent it from blocking clicks
        await driver.executeScript("document.querySelector('.overlay').style.display = 'none';");

        // Set localStorage user
        await driver.executeScript(`localStorage.setItem('userEmail', '${testUserEmail}');`);
        await driver.navigate().refresh();
        await driver.sleep(2000);  // Wait for any local storage changes to take effect

        await driver.wait(until.titleIs('Change Password - Vehicle Management System'), 5000);

        // Function to ensure the element exists and is visible
        async function waitForElement(selector, timeout = 5000) {
            await driver.wait(until.elementLocated(By.css(selector)), timeout);
            const element = await driver.findElement(By.css(selector));
            await driver.wait(until.elementIsVisible(element), timeout);
            return element;
        }

        async function runTestCase(tcName, email, currentPassword, newPassword, confirmPassword, expectedMsgContains) {
            // Clear fields
            const emailInput = await waitForElement('#email');
            const currentPasswordInput = await waitForElement('#currentPassword');
            const newPasswordInput = await waitForElement('#newPassword');
            const confirmPasswordInput = await waitForElement('#confirmPassword');

            await emailInput.clear();
            await currentPasswordInput.clear();
            await newPasswordInput.clear();
            await confirmPasswordInput.clear();

            // Fill fields
            await emailInput.sendKeys(email);
            await currentPasswordInput.sendKeys(currentPassword);
            await newPasswordInput.sendKeys(newPassword);
            await confirmPasswordInput.sendKeys(confirmPassword);

            let changePasswordBtn = await driver.findElement(By.id('changePasswordBtn'));
            await driver.executeScript("arguments[0].scrollIntoView(true);", changePasswordBtn);

            // Wait for the button to be visible and enabled
            await driver.wait(until.elementIsVisible(changePasswordBtn), 5000);
            await driver.wait(until.elementIsEnabled(changePasswordBtn), 5000);

            try {
                // Attempt to click the button
                await changePasswordBtn.click();
            } catch (e) {
                console.error(" Failed to click button, attempting JavaScript click...");
                await driver.executeScript("arguments[0].click();", changePasswordBtn);
            }

            await driver.sleep(2000);

            // Wait for the statusMessage element to appear and get its text
            let statusText = '';
            try {
                statusText = await driver.wait(until.elementLocated(By.id('statusMessage')), 5000).getText();
            } catch (error) {
                console.error(' Error: Status message element not found.', error);
            }

            if (statusText.toLowerCase().includes(expectedMsgContains.toLowerCase())) {
                console.log(` ${tcName}: Passed`);
            } else {
                console.log(` ${tcName}: Failed (Expected: ${expectedMsgContains}, Got: ${statusText})`);
            }
        }

        // --- Black Box Test Cases ---
        // 1. Empty fields (Equivalence Partitioning - Invalid Input)
        await runTestCase('TC_CP_01 Empty Fields', '', '', '', '', 'Please fill in all fields');

        // 2. Wrong email entered (Equivalence Partitioning - Invalid Email)
        await runTestCase('TC_CP_02 Wrong Email', 'wrong@example.com', 'OldPassword@123', 'NewPassword@123', 'NewPassword@123', 'Email does not match');

        // 3. Current password wrong (Equivalence Partitioning - Invalid Password)
        await runTestCase('TC_CP_03 Wrong Current Password', testUserEmail, 'WrongPassword', 'NewPassword@123', 'NewPassword@123', 'incorrect');

        // 4. New password and confirm mismatch (Equivalence Partitioning - Mismatch Password)
        await runTestCase('TC_CP_04 Password Mismatch', testUserEmail, 'OldPassword@123', 'NewPassword@123', 'DifferentPassword', 'do not match');

        // 5. New password too short (Boundary Value Analysis - Length < 8)
       // await runTestCase('TC_CP_05 Short Password', testUserEmail, testUserPassword, 'Abc1@', 'Abc1@', 'at least 8 characters');

        // 6. New password exactly 8 characters (Boundary Value Analysis - Length = 8)
        //await runTestCase('TC_CP_06 Exact 8 Characters', testUserEmail, testUserPassword, 'Abc@1234', 'Abc@1234', 'successfully');

        // 7. Password with only special characters (Equivalence Partitioning - Special chars only)
        //await runTestCase('TC_CP_07 Special Chars Only', testUserEmail, 'Abc@1234', '@@@@@@@@@', '@@@@@@@@@', 'successfully');

        // 8. SQL Injection Attempt (Security Testing)
        //await runTestCase('TC_CP_08 SQL Injection Attempt', testUserEmail, '@@@@@@@@@', "' OR '1'='1", "' OR '1'='1", 'at least 8 characters');

        // 9. Password with boundary 20 characters (Boundary Value Analysis - Max reasonable length)
        //await runTestCase('TC_CP_09 20 Char Password', testUserEmail, '@@@@@@@@@', 'Abcdefghijk@1234567', 'Abcdefghijk@1234567', 'successfully');

        // 10. Valid full password change success (Equivalence Partitioning - Valid)
        //await runTestCase('TC_CP_10 Full Valid Change', testUserEmail, 'OldPassword@123', 'MyNewPassword@2025', 'MyNewPassword@2025', 'successfully');

    } catch (error) {
        console.error(' Error during tests:', error);
    } finally {
        console.log(' Cleaning up...');

        // Delete the test user from the database
        await connection.query('DELETE FROM users WHERE email = ?', [testUserEmail]);

        // Close the database connection and Selenium driver
        await connection.end();
        await driver.quit();
    }
})();
