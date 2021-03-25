// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// puppeteer usage as normal
//TODO: change headless to TRUE after
puppeteer.launch({ headless: true }).then(async (browser) => {
  console.log("Running tests..");
  const page = await browser.newPage();

  // Load webpage
  await page.goto("https://yada.dev");
  await page.waitForTimeout(5000);

  // Load signin popup
  const newPagePromise = new Promise((x) =>
    browser.once("targetcreated", (target) => x(target.page()))
  );
  sign_in = (await page.$x('//span[text()="Sign in with Google"]/../..'))[0];
  sign_in.click();
  const popup = await newPagePromise;
  await popup.bringToFront();
  console.log(popup.url());

  // Enter credentials
  await popup.waitForTimeout(5000);
  //   email = (await popup.$x('//input[@type="email"]'))[0];
  //   email.type("yada.bugs@gmail.com");
  await popup.type('input[type="email"]', "yada.bugs@gmail.com");
  await popup.waitForTimeout(1000);

  //   await popup.waitForSelector("#identifierNext");
  //   await popup.click("#identifierNext");
  //   next = (await popup.$x('//button'))[3];
  //   next.click();
  await popup.waitForTimeout(5000);

  // Cleanup
  await popup.screenshot({ path: "/Users/Akshay/Downloads/example.png" });
  await browser.close();
  console.log(`All done, check the results. ✨`);
});
