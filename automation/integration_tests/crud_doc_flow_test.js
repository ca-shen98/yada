/**
 * INTEGRATION TEST
 *
 * Tests:
 *  - Creation, renaming, and deletion of a document
 *  - Insertion of content and tagging of a part of it
 *
 *  Requires:
 *  - Yada running @ localhost:3000
 *  - credentials.json with Test Account's Google Info
 *
 * Outputs:
 *  - Success or Failure message, along with logs for each action taken
 *  - Timeouts included as a way to fail test if things change
 *
 */

// Dependencies
const puppeteer = require("puppeteer-extra");
const assert = require("assert");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

// Launch browser
const headless = true;
puppeteer.launch({ headless: headless }).then(async (browser) => {
  const utils = require("./test_utils.js");
  console.log("[[ TEST: DOC FLOWS ]]");
  var page = null;
  try {
    page = await browser.newPage();
    await utils.loginToYada(page, headless);

    // Wait for files to load then clear files beforehand
    await page.waitForTimeout(1500);
    await utils.deleteAllFiles(page);

    // Create New Document
    console.log("Creating test doc");
    await (await utils.waitAndGetNewDocumentButton(page)).click();

    // Sometimes a delay + key press is necessary before typing
    await page.waitForTimeout(2000);
    await page.keyboard.press("ArrowRight");

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
        timeout: utils.DEFAULT_ELEMENT_TIMEOUT,
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
    await (await utils.waitAndGetAddTagInput(page)).focus();
    await page.waitForTimeout(2500);
    await page.keyboard.type(tag);
    await page.waitForTimeout(500);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);

    // Save and Confirm Success
    console.log("Save doc and confirm success snackbar appears");
    await (await utils.getSaveButton(page)).click();
    const successMsg = await utils.waitAndGetSuccessToastMessage(page);
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
    await page.goto(utils.yada_url);
    await page.waitForXPath('//div[contains(@class, "ProseMirror")]', {
      timeout: utils.DEFAULT_ELEMENT_TIMEOUT,
    });

    // Check file name was updated correctly by comparing against Navbar
    console.log("Verify file name is: " + fileName);
    const pulledFileName = await utils.getOpenFileName(page);
    assert(
      pulledFileName == fileName,
      "File name differs. Got: " + pulledFileName + ", but expected " + fileName
    );

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
      { timeout: utils.DEFAULT_ELEMENT_TIMEOUT }
    );
    const tagName = await tagEl.evaluate((el) => el.textContent);
    assert(
      tagName == tag,
      "Tag differs. See: " + tagName + ", but expected " + tag
    );

    // Cleanup
    console.log("Begin cleanup");
    await utils.deleteAllFiles(page);

    console.log(`[SUCCESS] ✨`);
  } catch (err) {
    await page.screenshot({ path: "./doc_flow_error.png" });
    console.error("[FAILURE] Reason for failure: " + err.message);
  }
  await browser.close();
});
