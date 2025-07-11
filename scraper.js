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
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.waitForSelector('.variations_form', { visible: true });
    await page.screenshot({path: "screenshot2.png"}); 

    let searchTerm = "shirt";
    page.evaluate((searchTerm)=> {
      let input = document.querySelector('#wp-block-search__input-1')
      let form = document.querySelector('aside.header-widget-area:nth-child(1) > section:nth-child(1) > form:nth-child(1)')

      input.value = searchTerm

      form.submit();
      
    }, searchTerm);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({path: "screenshot3.png"}); 

    let imageselect = 'li.ast-grid-common-col:nth-child(1) > div:nth-child(1) > a:nth-child(1) > img:nth-child(1)'

  // Get the image URL (change selector as needed)
  const imageUrl = await page.$eval(imageselect, img => img.src);

  // Download the image using Node.js (not via browser download)
  const viewSource = await page.goto(imageUrl);
  const buffer = await viewSource.buffer();

  // Save the image to disk
  const downloadPath = path.resolve('./downloads');
  if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);
  fs.writeFileSync(path.join(downloadPath, 'downloaded_image.jpg'), buffer);
      await browser.close();
}
loadPage();