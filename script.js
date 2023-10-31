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
    fromPageLocalStore.then((res) => {
      const token = JSON.parse(res[0].result).token;
      console.log(token);
      checkApi(token);
    });
  });
});


function getCookies(){
  chrome.cookies.getAll(Object(), function (cookies) {
    console.log("Cookies for " + url.origin + ":");
    console.log(cookies);
    console.log(JSON.stringify(cookies));
    });
  return cookies;
}

document.getElementById("getSessionStorage").addEventListener("click", function () {
  const sessionData = { ...sessionStorage };
  console.log("Session Storage Data:");
  console.log(sessionData);
});

function checkApi(token){
  const query = `
    query {
      me {
        username
      } 
    }
  `;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `JWT ${token}`
    },
    body: JSON.stringify({ query }),
  };

  fetch('https://api.petroly.co/', options)
    .then(response => response.json())
    .then(data => {
      // Handle the GraphQL response data here
      console.log(data);
    })
    .catch(error => {
      // Handle any errors that occurred during the request
      console.error('Error:', error);
  });
}
