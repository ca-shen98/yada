// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// puppeteer usage as normal
//TODO: change headless to TRUE after
puppeteer.launch({ headless: false }).then(async (browser) => {
  console.log("Running tests..");
  const page = await browser.newPage();
  await page.goto("https://yada.dev");
  await page.waitForTimeout(5000);
  sign_in = (await page.$x('//span[text()="Sign in with Google"]/../..'))[0];
  sign_in.click();

  await page.waitForTimeout(5000);
  await browser.close();
  console.log(`All done, check the results. ✨`);
});
