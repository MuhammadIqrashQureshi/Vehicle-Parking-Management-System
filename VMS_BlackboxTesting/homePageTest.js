const { Builder, By, until } = require('selenium-webdriver');

(async function homepageTest() {
    // Launch Chrome
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // 1. Open your web app
        await driver.get('http://127.0.0.1:5500/SE_Frontend/mainpage1.html');


        // 2. Wait until page is loaded and get the title
        await driver.wait(until.titleIs('Vehicle Management System'), 5000); 

        // 3. Fetch the actual title
        let title = await driver.getTitle();
        console.log('Page title is:', title);

        // 4. (Optional) Check if title is what you expect
        if (title === 'Vehicle Management System') {
            console.log(' Homepage title is correct.');
        } else {
            console.log(' Homepage title is wrong.');
        }

    } catch (err) {
        console.error('Error during test:', err);
    } finally {
        // 5. Quit the browser
        //await driver.quit();
    }
})();
