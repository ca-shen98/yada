// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

// Read credentials
var json = require("./credentials.json"); //(with path)

// Launch browser
const headless = false;
puppeteer.launch({ headless: headless }).then(async (browser) => {
  console.log("Running tests..");

  // Sign in to Stack Overflow first for google auth to work
  const page = await browser.newPage();
  await page.goto(
    "https://stackoverflow.com/users/login?ssrc=head&returnurl=https%3a%2f%2fstackoverflow.com%2f"
  );
  await page.waitForTimeout(3000);

  sign_in = (await page.$x("//button"))[0];
  sign_in.click();
  await page.waitForTimeout(1000);

  await page.type('input[type="email"]', json["username"]);
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(3000);

  await page.type('input[type="password"]', json["password"]);
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(10000);

  // Sign into Yada
  await page.goto("https://yada.dev");
  await page.waitForTimeout(5000);
  sign_in = (await page.$x('//span[text()="Sign in with Google"]/../..'))[0];
  sign_in.click();
  sign_in.click();
  sign_in.click();
  await page.waitForTimeout(15000);

  // Record screenshot of results
  await page.screenshot({ path: "/Users/Akshay/Downloads/example.png" });
  await browser.close();
  console.log(`All done, check the results. ✨`);
});
