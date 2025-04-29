const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

(async function learnMorePageTest() {
    let driver = await new Builder().forBrowser('chrome').build();
    
    try {
        console.log("Starting Learn More Page Tests...");
        await driver.get('http://127.0.0.1:5500/SE_Frontend/learn-more.html');

        // TC-01: Verify page title
        await testPageTitle(driver);
        
        // TC-02: Verify navigation links functionality
        await testNavigationLinks(driver);
        
        // TC-03: Validate section presence
        await testSectionPresence(driver);
        
        // TC-04: Verify feature cards count (Equivalence Partitioning)
        await testFeatureCards(driver);
         
        // TC-05: Verify footer content
        await testFooterContent(driver);
        
        
        // TC-06: Verify hover effects
        await testHoverEffects(driver);
        
        // TC-07: Check content visibility
        await testContentVisibility(driver);
        

        console.log("All tests completed successfully!");

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await driver.quit();
    }
})();

// ==================== Test Cases ====================

async function testPageTitle(driver) {
    try {
        await driver.wait(until.titleIs('Learn More - Vehicle Management System'), 5000);
        const title = await driver.getTitle();
        assert.strictEqual(title, 'Learn More - Vehicle Management System');
        console.log(' TC-01: Page title verification passed');
    } catch (err) {
        console.error(' TC-01: Page title verification failed');
        throw err;
    }
}

async function testNavigationLinks(driver) {
    try {
        // Test Login link
        const loginLink = await driver.findElement(By.css('a.login'));
        await loginLink.click();
        await driver.wait(until.urlContains('login.html'), 3000);
        await driver.navigate().back();
        
        // Test Signup link
        const signupLink = await driver.findElement(By.css('a.signup'));
        await signupLink.click();
        await driver.wait(until.urlContains('signup.html'), 3000);
        await driver.navigate().back();
        
        console.log(' TC-02: Navigation links functionality passed');
    } catch (err) {
        console.error(' TC-02: Navigation links functionality failed');
        throw err;
    }
}

async function testSectionPresence(driver) {
    const sections = ['about', 'features', 'benefits', 'faq'];
    try {
        for (const section of sections) {
            const element = await driver.findElement(By.id(section));
            assert.strictEqual(await element.isDisplayed(), true);
        }
        console.log(' TC-03: Section presence verification passed');
    } catch (err) {
        console.error(' TC-03: Section presence verification failed');
        throw err;
    }
}

async function testFeatureCards(driver) {
    try {
        // Equivalence Partitioning: Validate expected number of features
        const featureCards = await driver.findElements(By.className('feature-card'));
        assert.strictEqual(featureCards.length, 10, 'Expected 10 feature cards');
        console.log(' TC-04: Feature cards count verification passed');
    } catch (err) {
        console.error(' TC-04: Feature cards count verification failed');
        throw err;
    }
}


async function testFAQItem(questionElement) {
    const initialAnswer = await questionElement.findElement(By.xpath('./following-sibling::div'));
    const initialDisplay = await initialAnswer.getCssValue('display');
    
    await questionElement.click();
    await driver.sleep(500); // Allow animation
    
    const afterClickDisplay = await initialAnswer.getCssValue('display');
    assert.strictEqual(afterClickDisplay, 'block', 'Answer should be visible after click');
    
    await questionElement.click();
    await driver.sleep(500);
    
    const afterSecondClickDisplay = await initialAnswer.getCssValue('display');
    assert.strictEqual(afterSecondClickDisplay, 'none', 'Answer should hide after second click');
}

async function testFooterContent(driver) {
    try {
        const footerLinks = await driver.findElements(By.css('.footer-links a'));
        assert.strictEqual(footerLinks.length, 3, 'Expected 3 footer links');
        
        const copyrightText = await driver.findElement(By.css('.footer-content p')).getText();
        assert.match(copyrightText, /© 2025 Vehicle Management System/);
        
        console.log(' TC-05: Footer content verification passed');
    } catch (err) {
        console.error(' TC-05: Footer content verification failed');
        throw err;
    }
}

async function testResponsiveDesign(driver) {
    try {
        // Boundary Value Analysis for screen sizes
        const breakpoints = [
            {width: 1920, height: 1080}, // Desktop
            {width: 768, height: 1024},  // Tablet
            {width: 375, height: 667}    // Mobile
        ];
        
        for (const size of breakpoints) {
            await driver.manage().window().setRect(size);
            await driver.sleep(500);
            
            const featuresGrid = await driver.findElement(By.className('features-grid'));
            const displayStyle = await featuresGrid.getCssValue('grid-template-columns');
            
            if (size.width <= 768) {
                assert.match(displayStyle, /1fr/, 'Mobile layout should have single column');
            } else {
                assert.match(displayStyle, /repeat/, 'Desktop layout should have multiple columns');
            }
        }
        console.log(' TC-07: Responsive design verification passed');
    } catch (err) {
        console.error(' TC-07: Responsive design verification failed');
        throw err;
    }
}

async function testHoverEffects(driver) {
    try {
        const featureCard = await driver.findElement(By.className('feature-card'));
        const initialBackground = await featureCard.getCssValue('background-color');
        
        await driver.actions().move({origin: featureCard}).perform();
        await driver.sleep(500);
        
        const hoverBackground = await featureCard.getCssValue('background-color');
        assert.notStrictEqual(hoverBackground, initialBackground, 'Hover effect should change background');
        
        console.log(' TC-06: Hover effects verification passed');
    } catch (err) {
        console.error(' TC-06: Hover effects verification failed');
        throw err;
    }
}

async function testContentVisibility(driver) {
    try {
        const elementsToVerify = [
            By.css('.section h2'),
            By.css('.feature-card i'),
            By.css('.faq-question')
        ];
        
        for (const selector of elementsToVerify) {
            const elements = await driver.findElements(selector);
            for (const element of elements) {
                assert.strictEqual(await element.isDisplayed(), true);
            }
        }
        console.log(' TC-07: Content visibility verification passed');
    } catch (err) {
        console.error(' TC-07: Content visibility verification failed');
        throw err;
    }
}

async function testInternalLinks(driver) {
    try {
        const internalLinks = await driver.findElements(By.css('a[href^="#"]'));
        for (const link of internalLinks) {
            await link.click();
            await driver.sleep(500);
            const currentUrl = await driver.getCurrentUrl();
            assert.match(currentUrl, /#/, 'Internal link should update URL hash');
        }
        console.log(' TC-10: Internal links verification passed');
    } catch (err) {
        console.error(' TC-10: Internal links verification failed');
        throw err;
    }
}