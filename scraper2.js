import puppeteer from "puppeteer";

(async () => {
    const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto("https://www.imdb.com/search/title/?groups=top_1000&sort=user_rating,desc", { waitUntil: "networkidle2" });

    const loadMoreSelector = "button.ipc-see-more__button";
    let retryCount = 0;
    const maxRetries = 3;
    // Loop to handle dynamic loading and clciking of the "load more" button
       while (true) { 
        try {
            // Wait for the button to appear on the page, with a timeout.
            await page.waitForSelector(loadMoreSelector, { timeout: 5000 });
            // This handles scrolling the element into view automatically.
            await page.click(loadMoreSelector);
            // Reset the retry count on a successful click.
            retryCount = 0;
            // Wait a moment for the new content to load using the correct function.
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (err) {
            // If the selector times out, it means the button is no longer visible.
            // increment our retry counter.
            console.log(`Button not found. Retrying... (${retryCount + 1}/${maxRetries})`);
            retryCount++;

            if (retryCount >= maxRetries) {
                // Reached max retries
                console.log("No more 'Load more' button after multiple retries. Stopping.");
                break;
            }
            // Wait a little before the next retry 
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }


    // Scrape all movies
    const movies = await page.evaluate(() => {
        const rows = document.querySelectorAll(".ipc-metadata-list-summary-item");
        return Array.from(rows).map((row, index) => {
            const rank = index + 1;
            const title = row.querySelector("h3.ipc-title__text")?.innerText.trim().replace(/\d+\.\s*/, '') || "";
            const year = row.querySelector(".dli-title-metadata-item:first-of-type")?.innerText || "";
            const duration = row.querySelector(".dli-title-metadata-item:nth-of-type(2)")?.innerText || "";
            const rating = row.querySelector(".ipc-rating-star--rating")?.innerText || "";
            return { rank, title, year, duration, rating };
        });
    });

    console.log(`Scraped ${movies.length} movies`);

    //format Markdown table like before
    function formatMarkdownTable(data) {
        const headers = ["Rank", "Title", "Year", "Duration", "Rating"];
        const rows = data.map(m => [
            m.rank?.toString() || "",
            m.title,
            m.year,
            m.duration,
            m.rating,
        ]);

        const table = [headers, ...rows];
        const colWidths = headers.map((_, i) => Math.max(...table.map(row => row[i]?.length || 0)));
        const pad = (text, width) => (text + " ".repeat(width)).slice(0, width);

        const lines = table.map(row => "| " + row.map((cell, i) => pad(cell, colWidths[i])).join(" | ") + " |");
        const alignments = ["right", "left", "right", "center", "right"];
        const separator = "| " + alignments.map(a => a === "left" ? ":---" : a === "right" ? "---:" : ":---:").join(" | ") + " |";
        lines.splice(1, 0, separator);

        return lines.join("\n");
    }

    console.log(formatMarkdownTable(movies));

    await browser.close();
})();
