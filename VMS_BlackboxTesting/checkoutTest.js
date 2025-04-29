const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

// Base URL for testing
const BASE_URL = 'http://127.0.0.1:5500/SE_Frontend/';

// Test case implementation for vehicle check-out system
async function runVehicleCheckOutTests() {
    let driver = await new Builder().forBrowser('chrome').build();
    
    try {
        console.log(' Starting Vehicle Check-out System Tests');

        await testValidEmailAndVehicleNumberCheckout(driver);
        await testEmptyEmailCheckout(driver);
        await testInvalidEmailFormatCheckout(driver);
        await testEmptyVehicleNumberCheckout(driver);
        await testNumbersOnlyVehicleCheckout(driver);
        await testSpecialCharsInVehicleNumberCheckout(driver);
        await testMinLengthEmailCheckout(driver);
        await testVeryLongVehicleNumberCheckout(driver);
        await testBackButtonNavigationCheckout(driver);
        await testHomeIconNavigationCheckout(driver);

        console.log(' All checkout tests completed');
    } catch (err) {
        console.error(' Error during checkout test execution:', err);
    } finally {
        await driver.quit();
    }
}

// TC-01: Valid email and vehicle number for checkout
async function testValidEmailAndVehicleNumberCheckout(driver) {
    console.log('\n Running TC-01: Valid email and vehicle number for checkout');
    try {
        await driver.get(`${BASE_URL}checkout.html`);
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');
        
        await driver.findElement(By.id('userEmail')).sendKeys('test@example.com');
        await driver.findElement(By.id('checkOutVehicleNumber')).sendKeys('XYZ123');
        await driver.findElement(By.id('checkOutBtn')).click();
        
        try {
            const messageElement = await driver.findElement(By.id('message'));
            console.log(' TC-01 PASSED: Checkout form submitted successfully');
        } catch (error) {
            console.log(' TC-01 FAILED: Message element not found after checkout submission');
        }
    } catch (error) {
        console.error(' TC-01 FAILED:', error);
    }
}

// TC-02: Empty email during checkout
async function testEmptyEmailCheckout(driver) {
    console.log('\n Running TC-02: Empty email during checkout');
    try {
        await driver.get(`${BASE_URL}checkout.html`);
        
        await driver.findElement(By.id('checkOutVehicleNumber')).sendKeys('ABC456');
        await driver.findElement(By.id('checkOutBtn')).click();

        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('checkout.html')) {
            console.log(' TC-02 PASSED: Empty email prevented checkout submission');
        } else {
            console.log(' TC-02 FAILED: Empty email did not prevent checkout submission');
        }
    } catch (error) {
        console.error(' TC-02 FAILED:', error);
    }
}

// TC-03: Invalid email format during checkout
async function testInvalidEmailFormatCheckout(driver) {
    console.log('\n Running TC-03: Invalid email format during checkout');
    try {
        await driver.get(`${BASE_URL}checkout.html`);

        await driver.findElement(By.id('userEmail')).sendKeys('wrongemailformat');
        await driver.findElement(By.id('checkOutVehicleNumber')).sendKeys('LMN789');
        await driver.findElement(By.id('checkOutBtn')).click();

        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('checkout.html')) {
            console.log(' TC-03 PASSED: Invalid email format prevented checkout submission');
        } else {
            console.log(' TC-03 FAILED: Invalid email format did not prevent checkout submission');
        }
    } catch (error) {
        console.error(' TC-03 FAILED:', error);
    }
}

// TC-04: Empty vehicle number during checkout
async function testEmptyVehicleNumberCheckout(driver) {
    console.log('\n Running TC-04: Empty vehicle number during checkout');
    try {
        await driver.get(`${BASE_URL}checkout.html`);
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');

        await driver.findElement(By.id('userEmail')).sendKeys('test@example.com');
        await driver.findElement(By.id('checkOutBtn')).click();

        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('checkout.html')) {
            console.log(' TC-04 PASSED: Empty vehicle number prevented checkout');
        } else {
            console.log(' TC-04 FAILED: Empty vehicle number did not prevent checkout');
        }
    } catch (error) {
        console.error(' TC-04 FAILED:', error);
    }
}

// TC-05: Numbers-only vehicle number during checkout
async function testNumbersOnlyVehicleCheckout(driver) {
    console.log('\n🔍 Running TC-05: Numbers-only vehicle number during checkout');
    try {
        await driver.get(`${BASE_URL}checkout.html`);
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');

        await driver.findElement(By.id('userEmail')).sendKeys('test@example.com');
        await driver.findElement(By.id('checkOutVehicleNumber')).sendKeys('123456');
        await driver.findElement(By.id('checkOutBtn')).click();

        try {
            const messageElement = await driver.findElement(By.id('message'));
            console.log(' TC-05 PASSED: Checkout accepted numbers-only vehicle number');
        } catch (error) {
            console.log(' TC-05 FAILED: Message not found after submission');
        }
    } catch (error) {
        console.error(' TC-05 FAILED:', error);
    }
}

// TC-06: Vehicle number with special characters during checkout
async function testSpecialCharsInVehicleNumberCheckout(driver) {
    console.log('\n Running TC-06: Vehicle number with special characters during checkout');
    try {
        await driver.get(`${BASE_URL}checkout.html`);
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');

        await driver.findElement(By.id('userEmail')).sendKeys('test@example.com');
        await driver.findElement(By.id('checkOutVehicleNumber')).sendKeys('CAR-007!');
        await driver.findElement(By.id('checkOutBtn')).click();

        try {
            const messageElement = await driver.findElement(By.id('message'));
            console.log(' TC-06 PASSED: Special characters in vehicle number handled at checkout');
        } catch (error) {
            console.log(' TC-06 FAILED: Message not found after submission');
        }
    } catch (error) {
        console.error(' TC-06 FAILED:', error);
    }
}

// TC-07: Minimum length valid email during checkout
async function testMinLengthEmailCheckout(driver) {
    console.log('\n Running TC-07: Minimum length valid email during checkout');
    try {
        await driver.get(`${BASE_URL}checkout.html`);
        await driver.executeScript('localStorage.setItem("userEmail", "a@b.c")');

        await driver.findElement(By.id('userEmail')).sendKeys('a@b.c');
        await driver.findElement(By.id('checkOutVehicleNumber')).sendKeys('SMALL1');
        await driver.findElement(By.id('checkOutBtn')).click();

        try {
            const messageElement = await driver.findElement(By.id('message'));
            console.log(' TC-07 PASSED: Minimum length email accepted at checkout');
        } catch (error) {
            console.log(' TC-07 FAILED: Message not found after submission');
        }
    } catch (error) {
        console.error(' TC-07 FAILED:', error);
    }
}

// TC-08: Very long vehicle number during checkout
async function testVeryLongVehicleNumberCheckout(driver) {
    console.log('\n🔍 Running TC-08: Very long vehicle number during checkout');
    try {
        await driver.get(`${BASE_URL}checkout.html`);
        await driver.executeScript('localStorage.setItem("userEmail", "test@example.com")');

        await driver.findElement(By.id('userEmail')).sendKeys('test@example.com');
        await driver.findElement(By.id('checkOutVehicleNumber')).sendKeys('LONGVEHICLE123456789LONGVEHICLE123456789');
        await driver.findElement(By.id('checkOutBtn')).click();

        try {
            const messageElement = await driver.findElement(By.id('message'));
            console.log(' TC-08 PASSED: Very long vehicle number handled during checkout');
        } catch (error) {
            console.log(' TC-08 FAILED: Message not found after submission');
        }
    } catch (error) {
        console.error(' TC-08 FAILED:', error);
    }
}

// TC-09: Back button navigation on checkout page
async function testBackButtonNavigationCheckout(driver) {
    console.log('\n🔍 Running TC-09: Back button navigation on checkout page');
    try {
        await driver.get(`${BASE_URL}mainpage.html`);
        await driver.get(`${BASE_URL}checkout.html`);

        await driver.findElement(By.id('backButton')).click();
        await driver.sleep(1000);

        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('mainpage.html')) {
            console.log(' TC-09 PASSED: Back button navigated correctly');
        } else {
            console.log(' TC-09 FAILED: Back button did not navigate correctly');
        }
    } catch (error) {
        console.error(' TC-09 FAILED:', error);
    }
}

// TC-10: Home icon navigation from checkout page
async function testHomeIconNavigationCheckout(driver) {
    console.log('\n🔍 Running TC-10: Home icon navigation from checkout page');
    try {
        await driver.get(`${BASE_URL}checkout.html`);
        await driver.findElement(By.css('.left-nav li a')).click();
        await driver.sleep(1000);

        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('mainpage.html')) {
            console.log(' TC-10 PASSED: Home icon navigated correctly');
        } else {
            console.log(' TC-10 FAILED: Home icon did not navigate correctly');
        }
    } catch (error) {
        console.error(' TC-10 FAILED:', error);
    }
}

// Run all checkout tests
runVehicleCheckOutTests();
