const puppeteer = require("puppeteer");
const path = require('path');
const fs = require("fs");

async function loadPage() {

    let browser = await puppeteer.launch(); //starts  brwoser instance
    let page = await browser.newPage(); // starts page instance

    await page.goto('https://based.win');  // select webpage to visit

    let pageTitle = await page.title(); // get page title
    let pageContents = await page.content();  // get page content
    
/*     console.log(pageContents);
    console.log('pageTitle= ', pageTitle);
    console.log('it worked'); */

    const filesToDelete = [
        path.join(__dirname, 'codes', 'web.pdf'),
        path.join(__dirname, 'codes', 'screenshot1.png'),
        path.join(__dirname, 'codes', 'screenshot2.png')
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
    
    await page.screenshot({path: "screenshot1.png"});   // get page screenshot
    await page.pdf({path: "web.pdf", format: "a4"});   // get page pdf
    page.evaluate

    let textSelector = 'li.ast-grid-common-col:nth-child(1) > div:nth-child(2) > a:nth-child(1) > h2:nth-child(1)';
    let selectedContent = await page.evaluate((sel) => {

     return document.querySelector(sel).innerText;

    }, textSelector)
    
    console.log('Returned Page content:', selectedContent)

    let linkselect ='li.ast-grid-common-col:nth-child(1) > div:nth-child(2) > a:nth-child(1)'

    page.click(linkselect);
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.waitForSelector('.variations_form', { visible: true });
    await page.screenshot({path: "screenshot2.png"}); 
    await browser.close();
}
loadPage();