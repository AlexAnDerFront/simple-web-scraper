const puppeteer = require("puppeteer");
const path = require('path');
const fs = require("fs");

async function loadPage() {

    let browser = await puppeteer.launch(); //starts  brwoser isntance
    let page = await browser.newPage(); // starts page instance

    await page.goto('https://gp-one.com');  // select webpage to visit

    let pageTitle = await page.title(); // get page title
    let pageContents = await page.content();  // get page content
    
    console.log(pageContents);
    console.log('pageTitle= ', pageTitle);
    console.log('it worked');

    const filesToDelete = [
        path.join(__dirname, 'codes', 'web.pdf'),
        path.join(__dirname, 'codes', 'screenshot.png'),
    ];

    for (const filePath of filesToDelete) { // delete old files function
      try {
        await fs.unlink(filePath);
        console.log(`Deleted: ${filePath}`);
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.log(`File not found (skipped): ${filePath}`);
        } else {
          console.error(`Error deleting ${filePath}:`, err);
        }
      }
    }
    
    await page.screenshot({path: "screenshot.png"});   // get page screenshot
    await page.pdf({path: "web.pdf", format: "a4"});   // get page pdf

    await browser.close();
}
loadPage();