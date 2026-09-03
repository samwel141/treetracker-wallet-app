export const CAPABILITY_WEB_CHROME = [
  {
    browserName: "chrome",
    // Classic WebDriver (not BiDi): avoids the "node belongs to different document"
    // stale-element churn after the cross-origin redirect to Keycloak's pages.
    "wdio:enforceWebDriverClassic": true,
    "goog:chromeOptions": {
      // Mobile-first: the wallet app is mobile-first, so drive the web BDD run
      // (and its recorded videos) in an emulated iPhone viewport.
      mobileEmulation: {
        deviceMetrics: {
          width: 390,
          height: 844,
          pixelRatio: 3,
          mobile: true,
          touch: true,
        },
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
      args: [
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        // Headless by default so CI (which has no display) can launch Chrome.
        // Set HEADED=1 locally to watch the browser while the test runs.
        // (Explicit "1" check: any non-empty env value — e.g. "0" — is truthy.)
        ...(process.env.HEADED === "1" ? [] : ["--headless=new"]),
        "--window-size=390,844",
      ],
    },
  },
];

export const CAPABILITY_WEB_CHROME_FOR_DEBUG = [
  {
    browserName: "chrome",
    // Use classic WebDriver (not BiDi) — avoids the "node belongs to different
    // document" stale-element churn after the cross-origin redirect to Keycloak.
    "wdio:enforceWebDriverClassic": true,
    "goog:chromeOptions": {
      // Mobile-first: match CAPABILITY_WEB_CHROME so the debug run uses the
      // same emulated iPhone viewport as the recorded BDD run.
      mobileEmulation: {
        deviceMetrics: {
          width: 390,
          height: 844,
          pixelRatio: 3,
          mobile: true,
          touch: true,
        },
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
      args: [
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--auto-open-devtools-for-tabs",
        "--window-size=390,844",
      ],
    },
  },
];

export const CAPABILITY_ANDROID = [
  {
    platformName: "Android",
    "appium:deviceName": "Pixel_9a",
    "appium:isHeadless": true,
    "appium:app": `${process.env.PROJECT_ROOT_ANDROID}/android/app/build/outputs/apk/debug/app-debug.apk`,
    "appium:automationName": "UiAutomator2",
    "appium:appPackage": "com.gtw.app",
    "appium:appActivity": "com.gtw.app.MainActivity",
    "appium:noReset": true,
    "appium:newCommandTimeout": 240,
    "appium:appWaitPackage": "*",
    "appium:debugLogLevel": "debug",
    "appium:appWaitForLaunch": false,
  },
];

export const CAPABILITY_IOS = [
  {
    platformName: "iOS",
    "appium:deviceName": "iPhone 17 Pro",
    "appium:platformVersion": "26.1",
    "appium:automationName": "XCUITest",
    "appium:app": `${process.env.PROJECT_ROOT_IOS}`,
    "appium:autoGrantPermissions": true,
    "appium:noReset": true,
    "appium:newCommandTimeout": 240,
    "appium:appWaitPackage": "*",
    "appium:debugLogLevel": "debug",
    "appium:appWaitForLaunch": false,
  },
];
