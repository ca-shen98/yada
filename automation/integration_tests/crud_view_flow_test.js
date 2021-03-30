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
const headless = false;
puppeteer
  .launch({ headless: headless, ignoreDefaultArgs: ["--enable-automation"] })
  .then(async (browser) => {
    const loginUtils = require("./login_utils.js");
    console.log("[[ TEST: VIEW FLOWS ]]");
    var page = null;
    try {
      page = await browser.newPage();
      await loginUtils.loginToYada(page, headless);

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
      const saveBtn = await page.$('button[name="save_btn"]');
      await saveBtn.click();
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
      await listButtons[1].click(); // create view
      await page.waitForTimeout(250);
      const viewTypeButtons = await page.$x(
        '//li[contains(@class, "MuiListItem-button")]'
      );
      await viewTypeButtons[4].click(); // create text view
      await page.waitForTimeout(2000);

      // Rename view
      const fileNameSuffix = "----";
      const fileName = "Untitled" + fileNameSuffix;
      console.log("Renaming view to: " + fileName);
      await page.keyboard.type(fileNameSuffix, { delay: 200 });
      await page.waitForTimeout(1000);
      await page.keyboard.press("Enter");

      // Drag tag over
      console.log("Dragging tav over");
      const tagLine = await page.waitForXPath(
        // '//div[contains(@class, "tag_container")]',
        '//div[contains(@class, "MuiGrid-spacing-xs-1")]',
        { timeout: loginUtils.DEFAULT_ELEMENT_TIMEOUT }
      );
      const bounding_box = await tagLine.boundingBox();
      var x = bounding_box.x + (bounding_box.width * 3) / 4;
      const y = bounding_box.y + bounding_box.height / 2;

      // Add delays inbetween to trigger drag events,
      // else mouse moves are registered as selecting text
      await page.mouse.move(x, y);
      await page.waitForTimeout(250);

      await page.mouse.down();
      await page.waitForTimeout(250);

      x -= (bounding_box.width * 5) / 4;
      await page.mouse.move(x, y, { steps: 600 });
      await page.waitForTimeout(600);

      await page.mouse.up();
      await page.waitForTimeout(1000);

      // Save view
      console.log("Saving view and confirming success snackbar appears");
      const viewSaveBtn = await page.$('button[name="save_btn"]');
      await viewSaveBtn.click();
      const viewSuccessToast = await page.waitForXPath(
        '//div[contains(@class, "MuiAlert-message")]',
        { timeout: loginUtils.DEFAULT_ELEMENT_TIMEOUT }
      );
      const viewSuccessMsg = await viewSuccessToast.evaluate(
        (el) => el.textContent
      );
      const viewExpectedMsg = "View saved";
      assert(
        viewSuccessMsg == viewExpectedMsg,
        "Success message differs. Received: " +
          viewSuccessMsg +
          ", but wanted " +
          viewExpectedMsg
      );

      // Refresh
      console.log("Confirmed... Now refresh page");
      await page.goto(loginUtils.yada_url);

      // Verify content is there
      console.log("Verify View has the tag content: " + line2Text);
      const line2 = await page.waitForXPath(
        '//div[contains(@class, "ProseMirror")]//p',
        { timeout: loginUtils.DEFAULT_ELEMENT_TIMEOUT }
      );
      const viewText = await line2.evaluate((el) => el.textContent);
      assert(
        viewText == line2Text,
        "View content differs. View reads: " +
          viewText +
          ", but expected " +
          line2Text
      );

      // Check file name was updated correctly by comparing against Navbar
      console.log("Verify file name is: " + fileName);
      const fileNameEl = await page.waitForXPath(
        '//div[@id="navbar-file-name"]',
        { timeout: loginUtils.DEFAULT_ELEMENT_TIMEOUT }
      );
      const pulledFileName = await fileNameEl.evaluate((el) => el.textContent);
      assert(
        pulledFileName == fileName,
        "File name differs. Got: " +
          pulledFileName +
          ", but expected " +
          fileName
      );

      // Cleanup
      console.log("Begin cleanup");
      // Open menuitem for document in left bar
      await (
        await page.$x('//button[contains(@class, "fileList-iconButton")]')
      )[0].click();
      await page.waitForTimeout(250);
      listButtons = await page.$x(
        '//li[contains(@class, "MuiListItem-button")]'
      );
      console.log("Delete test doc");
      await listButtons[3].click(); // delete button for created doc
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
