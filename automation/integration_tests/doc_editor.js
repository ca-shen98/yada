// Dependencies
const puppeteer = require("puppeteer-extra");
const assert = require("assert");

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

  //TODO: sometimes stackoverflow gives us a captcha then asks us to log in
  //      again - i think there's a puppeteer plugin for captchas.

  // Sign into Yada
  await page.goto("https://yada.dev");
  await page.waitForTimeout(5000);
  sign_in = (await page.$x('//span[text()="Sign in with Google"]/../..'))[0];
  sign_in.click();
  sign_in.click();
  await page.waitForTimeout(2000);
  sign_in.click();
  await page.waitForTimeout(8000);

  // Create New Document
  (await page.$x('//button[@id="new_document_button"]'))[0].click();
  await page.waitForTimeout(1000);

  // Rename Document
  await page.keyboard.type("_new_name");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2000);

  // Add Text
  (await page.$x('//div[contains(@class, "ProseMirror")]'))[0].focus();
  await page.waitForTimeout(500);
  await page.keyboard.type("Type line 1");
  await page.waitForTimeout(500);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(250);
  await page.keyboard.type("Type line 2");
  await page.waitForTimeout(500);

  // Add Tag
  (await page.$x('//input[@id="add_tag_input"]'))[0].focus();
  await page.waitForTimeout(500);
  await page.keyboard.type("Tag_for_line_2");
  await page.waitForTimeout(500);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);

  // Save and Confirm Success
  (await page.$('button[name="save_btn"]')).click();
  await page.waitForXPath('//div[contains(@class, "MuiAlert-message")]');
  const successToast = (
    await page.$x('//div[contains(@class, "MuiAlert-message")]')
  )[0];
  const successMsg = await successToast.evaluate((el) => el.textContent);
  const expectedMsg = "Saved source file";
  assert(
    successMsg == expectedMsg,
    "Success message differs. Received: " +
      successMsg +
      ", but wanted " +
      expectedMsg
  );

  // TODO: Refresh page (check if tag still there)

  // Remove Document
  const fileListButtons = await page.$x(
    '//button[contains(@class, "fileList-iconButton")]'
  );
  fileListButtons[fileListButtons.length - 1].click();
  await page.waitForTimeout(250);
  const listButtons = await page.$x(
    '//li[contains(@class, "MuiListItem-button")]'
  );
  listButtons[listButtons.length - 1 - 4].click(); // delete button for created doc

  // Record screenshot of results
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "/Users/Akshay/Downloads/example.png" });
  await page.waitForTimeout(2000);
  await browser.close();
  console.log(`All done, check the results. ✨`);
});
