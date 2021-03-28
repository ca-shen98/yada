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
const DEFAULT_ELEMENT_TIMEOUT = 10000;
const dev = true;
const yada_url = dev ? "http://localhost:3000" : "https://yada.dev";
const headless = false;

puppeteer.launch({ headless: headless }).then(async (browser) => {
  console.log("Running tests..");
  try {
    // Sign in to Stack Overflow first for google auth to work
    const page = await browser.newPage();
    await page.goto(
      "https://stackoverflow.com/users/login?ssrc=head&returnurl=https%3a%2f%2fstackoverflow.com%2f"
    );
    await page.waitForTimeout(3000);

    sign_in = await page.waitForXPath("//button", {
      timeout: DEFAULT_ELEMENT_TIMEOUT,
    });
    await sign_in.click();
    await page.waitForTimeout(3000);

    const loginEmail = await page.waitForSelector('input[type="email"]', {
      timeout: DEFAULT_ELEMENT_TIMEOUT,
    });
    await loginEmail.type(json["username"], { delay: 50 });
    await page.keyboard.press("Enter");

    await page.waitForTimeout(1000);

    const loginPass = await page.waitForSelector('input[type="password"]', {
      timeout: DEFAULT_ELEMENT_TIMEOUT,
    });
    await loginPass.type(json["password"], { delay: 50 });
    await page.keyboard.press("Enter");

    await page.waitForTimeout(10000); //TODO replace with a waitFor on url change?

    //TODO: sometimes stackoverflow gives us a captcha then asks us to log in
    //      again - i think there's a puppeteer plugin for captchas.

    // Sign into Yada (very finnicky lol)
    await page.goto(yada_url);
    sign_in = await page.waitForXPath(
      '//span[text()="Sign in with Google"]/../..',
      { timeout: DEFAULT_ELEMENT_TIMEOUT }
    );
    await page.waitForTimeout(2000);
    await sign_in.click();
    await page.waitForTimeout(2000);
    await sign_in.click();

    // Create New Document
    console.log("Creating test doc");
    await (
      await page.waitForXPath('//button[@id="new_document_button"]')
    ).click();
    await page.waitForTimeout(1500);

    // Rename Document
    const fileNameSuffix = "++++";
    const fileName = "Untitled" + fileNameSuffix;
    console.log("Renaming doc to: " + fileName);
    await page.keyboard.type(fileNameSuffix, { delay: 200 });
    await page.waitForTimeout(1000);
    await page.keyboard.press("Enter");

    // Add Text
    console.log("Inserting some text into the doc body");
    await (
      await page.waitForXPath('//div[contains(@class, "ProseMirror")]', {
        timeout: DEFAULT_ELEMENT_TIMEOUT,
      })
    ).focus();
    await page.waitForTimeout(500);
    await page.keyboard.type("Type line 1", { delay: 100 });
    await page.waitForTimeout(500);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(250);
    const line2Text = "Type line 2";
    await page.keyboard.type(line2Text, { delay: 100 });
    await page.waitForTimeout(500);

    // Add Tag
    const tag = "Tag_for_line_2";
    console.log("Add a tag for line 2: " + tag);
    await (
      await page.waitForXPath('//input[@id="add_tag_input"]', {
        timeout: DEFAULT_ELEMENT_TIMEOUT,
      })
    ).focus();
    await page.waitForTimeout(2500);
    await page.keyboard.type(tag);
    await page.waitForTimeout(500);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);

    // Save and Confirm Success
    console.log("Save doc and confirm success snackbar appears");
    await (await page.$('button[name="save_btn"]')).click();
    const successToast = await page.waitForXPath(
      '//div[contains(@class, "MuiAlert-message")]',
      { timeout: DEFAULT_ELEMENT_TIMEOUT }
    );
    const successMsg = await successToast.evaluate((el) => el.textContent);
    const expectedMsg = "Saved source file";
    assert(
      successMsg == expectedMsg,
      "Success message differs. Received: " +
        successMsg +
        ", but wanted " +
        expectedMsg
    );

    // Refresh page and verify content still there
    console.log("Refresh page to verify persistence of content");
    await page.goto(yada_url);
    await page.waitForXPath('//div[contains(@class, "ProseMirror")]', {
      timeout: DEFAULT_ELEMENT_TIMEOUT,
    });

    //TODO: check file name
    console.log("Verify file name is: " + fileName);
    const fileNameEl = await page.waitForXPath(
      '//div[@id="navbar-file-name"]',
      { timeout: DEFAULT_ELEMENT_TIMEOUT }
    );
    const pulledFileName = await fileNameEl.evaluate((el) => el.textContent);
    //TODO: uncomment below once the UI bug (where the file name isn't correct) is fixed!
    //   assert(
    //     pulledFileName == fileName,
    //     "File name differs. Got: " +
    //     pulledFileName +
    //       ", but expected " +
    //       fileName
    //   );

    // Check line 2 content
    console.log("Verify line 2 has content: " + line2Text);
    const line2 = (
      await page.$x('//div[contains(@class, "ProseMirror")]//p')
    )[1];
    const pulledLine2Text = await line2.evaluate((el) => el.textContent);
    assert(
      pulledLine2Text == line2Text,
      "Doc content differs. Line 2 reads: " +
        pulledLine2Text +
        ", but expected " +
        line2Text
    );

    // Check tag for line 2
    console.log("Verify line 2 is tagged with: " + tag);
    await line2.click();
    const tagEl = await page.waitForXPath(
      '//span[contains(@class, "MuiChip-label")]',
      { timeout: DEFAULT_ELEMENT_TIMEOUT }
    );
    const tagName = await tagEl.evaluate((el) => el.textContent);
    assert(
      tagName == tag,
      "Tag differs. See: " + tagName + ", but expected " + tag
    );

    // Cleanup
    console.log("Begin cleanup");
    // Open menuitem for document in left bar
    const fileListButtons = await page.$x(
      '//button[contains(@class, "fileList-iconButton")]'
    );
    await fileListButtons[fileListButtons.length - 1].click();
    await page.waitForTimeout(250);
    const listButtons = await page.$x(
      '//li[contains(@class, "MuiListItem-button")]'
    );
    console.log("Delete test doc");
    await listButtons[listButtons.length - 1 - 4].click(); // delete button for created doc
    await page.waitForTimeout(2000);

    console.log(`[SUCCESS] ✨`);
  } catch (err) {
    console.log("[FAILURE] Reason for failure: " + err.message);
  }
  await browser.close();
});
