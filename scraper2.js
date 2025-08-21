import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.imdb.com/chart/top/", {
    waitUntil: "networkidle2",
  });

   await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
  // Scrape data
      const movies = await page.evaluate(() => {
      // Grab all rows
      const rows = document.querySelectorAll(".ipc-metadata-list-summary-item");

      return Array.from(rows).map((row, index) => {
        const rank = index + 1;
        const rawTitle = row.querySelector("h3.ipc-title__text")?.innerText.trim() || "";
        const title = rawTitle.replace(/^\d+\.\s*/, ""); // remove leading "1. "
        const year = row.querySelector("span.cli-title-metadata-item:nth-child(1)")?.innerText.trim() || "";
        const duration = row.querySelector("span.cli-title-metadata-item:nth-child(2)")?.innerText.trim() || "";
        const rating = row.querySelector(".ipc-rating-star--rating")?.innerText.trim() || "";

        return { rank, title, year, duration, rating };
      });
    });

    function formatMarkdownTable(data) {
      const headers = ["Rank", "Title", "Year", "Duration", "Rating"];
      const rows = data.map(m => [
        m.rank.toString(),
        m.title,
        m.year,
        m.duration,
        m.rating,
      ]);

      // combine header + rows
      const table = [headers, ...rows];

      // calculate max width for each column
      const colWidths = headers.map((_, i) =>
        Math.max(...table.map(row => row[i]?.length || 0))
      );

      // helper: pad cell to column width
      const pad = (text, width) => (text + " ".repeat(width)).slice(0, width);

      // build formatted table
      const lines = table.map((row, rowIndex) =>
        "| " +
        row.map((cell, i) => pad(cell, colWidths[i])).join(" | ") +
        " |"
      );

      // insert separator row after header
      const alignments = ["right", "left", "right", "center", "right"];

      const separator =
        "| " +
        alignments
          .map(a =>
            a === "left" ? ":---" :
            a === "right" ? "---:" :
            ":---:"
          )
          .join(" | ") +
        " |";


      lines.splice(1, 0, separator);

      return lines.join("\n");
    }
  // Format as Markdown table
    const markdown = formatMarkdownTable(movies);
    console.log(markdown);

  for (const movie of movies) {
    markdown += `| ${movie.rank} | ${movie.title} | ${movie.year} | ${movie.duration} | ${movie.rating} |\n`;
  }

  console.log(markdown);

  await browser.close();
})();
