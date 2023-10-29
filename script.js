document.getElementById("getCookies").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    const url = new URL(tab.url);

    const fromPageLocalStore = chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        console.log(sessionStorage);
        return JSON.stringify(sessionStorage);
      }
    })
    fromPageLocalStore.then(res => console.log(JSON.parse(res[0].result)));

    chrome.cookies.getAll(Object(), function (cookies) {
      console.log("Cookies for " + url.origin + ":");
      console.log(cookies);
    });
  });
});

document.getElementById("getSessionStorage").addEventListener("click", function () {
  const sessionData = { ...sessionStorage };
  console.log("Session Storage Data:");
  console.log(sessionData);
});
