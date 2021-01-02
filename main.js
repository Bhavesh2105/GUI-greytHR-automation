require("hazardous");
const { BrowserWindow, app, ipcMain } = require("electron");
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-core");
const Store = require("electron-store");
const fs = require("fs");
const schedule = require("node-schedule");
const store = new Store();
const date = new Date();
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  try {
    config.get();
  } catch (err) {
    if (err) {
      win.loadFile("index.html");
    }
  }
}
const main = async (withHome, alreadyInitialized, schedule) => {
  if (!alreadyInitialized) {
    await pie.initialize(app);
  }
  const browser = await pie.connect(app, puppeteer);
  if (withHome) createWindow();
  console.log(app.getPath("userData"));
  if (store.get("username") && store.get("password") && schedule) {
    const window = new BrowserWindow();
    const url = "https://fyntunesol.greythr.com/";
    await window.loadURL(url);
    const page = await pie.getPage(browser, window);
    try {
      await page.waitForSelector(".sidebar");
      await page.$eval("input", (el) => el.focus());
      await page.keyboard.type(store.get("username"));
      await page.keyboard.press("Tab");
      await page.keyboard.type(store.get("password"));
      await page.keyboard.press("Enter");
      await page.waitForSelector(".home-dashboard");
      await page.waitForSelector(".btn");
      let x = await page.$eval(".btn", (el) => {
        el.click();
        return el.innerText;
      });
      window.destroy();
      console.log(x);
    } catch (error) {
      console.log(error);
    }
  }
};
main(true, false, false);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.on("userDetails", (event, arg) => {
  console.log(arg);
  store.set("username", arg.username);
  store.set("password", arg.password);
  main(false, true);
  event.returnValue = true;
});
ipcMain.on("loaded", (event, arg) => {
  if (store.get("username")) {
    event.returnValue = store.get("username");
  } else event.returnValue = false;
});
ipcMain.on("override", async (event, arg) => {
  const date = new Date();
  if (arg) {
    let inner = await main(false, true, true);

    fs.appendFile(
      app.getPath("userData") + "/log.txt",
      `\n ${inner} at ${date.getHours()}:${date.getMinutes()} on ${date.getDate()}/${date.getMonth()}`,
      (e) => {
        if (e) {
          console.log(e);
        }
      }
    );
  }
});
schedule.scheduleJob({ hour: 09, minute: 00 }, async () => {
  const date = new Date();
  let inner = await main(false, true, true);
  fs.appendFile(
    app.getPath("userData") + "/log.txt",
    `\n ${inner} at ${date.getHours()}:${date.getMinutes()} on ${date.getDate()}/${date.getMonth()}`,
    (e) => {
      if (e) {
        console.log(e);
      }
    }
  );
});
schedule.scheduleJob({ hour: 19, minute: 00 }, async () => {
  const date = new Date();
  let inner = await main(false, true, true);
  fs.appendFile(
    app.getPath("userData") + "/log.txt",
    `\n ${inner} at ${date.getHours()}:${date.getMinutes()} on ${date.getDate()}/${date.getMonth()}`,
    (e) => {
      if (e) {
        console.log(e);
      }
    }
  );
});
