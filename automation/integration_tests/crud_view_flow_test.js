/**
 * INTEGRATION TEST
 *
 * Tests:
 *  - Creation, renaming, and deletion of a view
 *  - Dragging of content over
 *
 *  * Requires:
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
puppeteer.launch({ headless: false }).then(async (browser) => {
  const loginUtils = require("./login_utils.js");
  console.log("[[ TEST: VIEW FLOWS ]]");
  var page = null;
  try {
    page = await browser.newPage();
    await loginUtils.loginToYada(page);

    // Create New Document
    console.log("Creating test doc");
    await (
      await page.waitForXPath('//button[@id="new_document_button"]')
    ).click();
    await page.waitForTimeout(1500);
    await page.keyboard.press("Enter");

    // Add Text
    console.log("Inserting some text into the doc body");
    await (
      await page.waitForXPath('//div[contains(@class, "ProseMirror")]', {
        timeout: loginUtils.DEFAULT_ELEMENT_TIMEOUT,
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
        timeout: loginUtils.DEFAULT_ELEMENT_TIMEOUT,
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
      { timeout: loginUtils.DEFAULT_ELEMENT_TIMEOUT }
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

    // Create a view
    console.log("Create text view");
    const fileListButtons = await page.$x(
      '//button[contains(@class, "fileList-iconButton")]'
    );
    await fileListButtons[fileListButtons.length - 1].click();
    await page.waitForTimeout(250);
    var listButtons = await page.$x(
      '//li[contains(@class, "MuiListItem-button")]'
    );
    await listButtons[listButtons.length - 1 - 6].click(); // create view
    await page.waitForTimeout(250);
    const viewTypeButtons = await page.$x(
      '//li[contains(@class, "MuiListItem-button")]'
    );
    await viewTypeButtons[viewTypeButtons.length - 1 - 3].click(); // create text view

    // Rename view
    await page.waitForTimeout(2000);
    const fileNameSuffix = "----";
    const fileName = "Untitled" + fileNameSuffix;
    console.log("Renaming view to: " + fileName);
    await page.keyboard.type(fileNameSuffix, { delay: 200 });
    await page.waitForTimeout(1000);
    await page.keyboard.press("Enter");

    //TODO: drag tag over
    const tagLine = await page.waitForXPath(
      'div[@data-rbd-drag-handle-context-id="0"]',
      { timeout: loginUtils.DEFAULT_ELEMENT_TIMEOUT }
    );
    const bounding_box = await tagLine.boundingBox();

    const x = bounding_box.x + bounding_box.width / 2;
    const y = bounding_box.y + bounding_box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 600, y);
    await page.mouse.up();

    //TODO: save view
    //TODO: refresh
    //TODO: verify content is there

    // Cleanup
    console.log("Begin cleanup");
    // Open menuitem for document in left bar
    await fileListButtons[fileListButtons.length - 1].click();
    await page.waitForTimeout(250);
    listButtons = await page.$x('//li[contains(@class, "MuiListItem-button")]');
    console.log("Delete test doc");
    await listButtons[listButtons.length - 1 - 4].click(); // delete button for created doc
    await page.waitForTimeout(2000);

    // Verify deletion worked
    const remainingFiles = await page.$x(
      '//button[contains(@class, "fileList-iconButton")]'
    );
    assert(
      remainingFiles.length == 0,
      "Deletion failed - files still exist for user"
    );

    console.log(`[SUCCESS] ✨`);
  } catch (err) {
    await page.screenshot({ path: "./error.png" });
    console.log("[FAILURE] Reason for failure: " + err.message);
  }
  await browser.close();
});
