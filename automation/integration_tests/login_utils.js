// const puppeteer = require("puppeteer-extra");

// Read credentials
var credentials = require("./credentials.json");

const DEFAULT_ELEMENT_TIMEOUT = 20000;
const dev = true;
const yada_url = dev ? "http://localhost:3000" : "https://yada.dev";

exports.DEFAULT_ELEMENT_TIMEOUT = DEFAULT_ELEMENT_TIMEOUT;
exports.dev = dev;
exports.yada_url = yada_url;

exports.loginToYada = async (page) => {
  // Sign in to Stack Overflow first for google auth to work
  console.log("Authenticating Google account via third-party");
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
  await page.waitForTimeout(500);
  await loginEmail.type(credentials["username"], { delay: 50 });
  await page.keyboard.press("Enter");

  await page.waitForTimeout(1000);

  const loginPass = await page.waitForSelector('input[type="password"]', {
    timeout: DEFAULT_ELEMENT_TIMEOUT,
  });
  await page.waitForTimeout(500);
  await loginPass.type(credentials["password"], { delay: 50 });
  await page.keyboard.press("Enter");

  // Wait for StackOverflow to authenticate our Google User TODO: replace with a waitFor?
  await page.waitForTimeout(10000);

  //TODO: sometimes stackoverflow gives a captcha - use puppeteer plugin for this

  // Sign into Yada
  console.log("Success... Logging into Yada now");
  await page.goto(yada_url);
  sign_in = await page.waitForXPath(
    '//span[text()="Sign in with Google"]/../..',
    { timeout: DEFAULT_ELEMENT_TIMEOUT }
  );
  await page.waitForTimeout(2000);
  await sign_in.click();

  // Use "Create Document" button as a test to confirm we've logged in
  await page.waitForXPath('//button[@id="new_document_button"]', {
    timeout: DEFAULT_ELEMENT_TIMEOUT,
  });
  console.log("Logged into Yada");
};
