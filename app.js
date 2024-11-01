const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const port = 4005;

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const amazonURL =
    "https://www.amazon.in/gp/browse.html?node=4092115031&ref_=nav_em_sbc_tvelec_gaming_consoles_0_2_9_12";
  let browser;
  try {
    // Launch Puppeteer in headless mode
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(amazonURL, { waitUntil: "domcontentloaded" });

    // Scraping data
    const data = await page.$$eval(
      ".a-section.octopus-pc-card-content .a-list-item",
      (elements) => {
        return elements.map((el) => ({
          title: el.querySelector(".octopus-pc-asin-title")?.innerText || "No Title",
          price: el.querySelector(".a-price .a-offscreen")?.innerText || "No Price",
          imageURL: el.querySelector("img")?.src || "",
        }));
      }
    );

    // Render scraped data in the index view
    res.render("index", { data });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data.");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
