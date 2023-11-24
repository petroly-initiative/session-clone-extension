let ENDPOINT = "http://localhost:8000/endpoint/";
ENDPOINT = "https://api.petroly.co/";
const HISTORY_URL =
  "https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/registrationHistory/registrationHistory";

window.onload = function () {
  document.getElementById("clone-btn").addEventListener("click", setupAndClone);
  document
    .getElementById("terms-btn")
    .addEventListener("click", showHiddenTerms);
};

function showHiddenTerms() {
  chrome.tabs.create({
    url: HISTORY_URL,
  });
}

function setupAndClone() {
  showWaiting();
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    // const url = new URL(tab.url);

    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        func: () => {
          console.log(sessionStorage);
          return JSON.stringify(sessionStorage);
        },
      })
      .then(tokenCallback)
      .then(getCookies)
      .then(saveCookies)
      .catch((err) => {
        console.error(err);
        showErrorAlert('Make sure you follow the instructions bellow.')
      });
  });

  // save cookies into Petroly
}

var token = "";

function tokenCallback(res) {
  token = JSON.parse(res[0].result).token;

  // retreive user from Petrly as a check test
  // checkApi(token);

  return token;
}

function getCookies(token) {
  // get cookies
  return chrome.cookies.getAll({ domain: "kfupm.edu.sa" });
}

function saveCookies(cookies) {
  console.log(cookies);
  console.log(token);

  const query = `
    mutation Save($cookiesStr: String!) {
      saveBannerSession(cookies: $cookiesStr)
    }
  `;

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify({
      query,
      variables: { cookiesStr: JSON.stringify(cookies) },
    }),
  };

  const cookiesExist = cookies.some((obj) => obj.name == "commonAuthId");

  chrome.cookies.remove(
    { url: "https://login.kfupm.edu.sa/", name: "commonAuthId" },
    (removedCookie) => {
      console.log(removedCookie);
    },
  );

  if (cookiesExist) {
    fetch(ENDPOINT, options)
      .then((response) => response.json())
      .then((data) => {
        // Handle the GraphQL response data here
        console.log(data);
        if (data.data) {
          showSuccessAlert();
        } else {
          console.log(data.errors);
          if (data.errors) {
            showErrorAlert(data.errors[0].message);
          }
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the request
        console.error("Error:", error);
      });
  } else {
    showErrorAlert(
      "Cookies've been eaten, sign out and in again in Banner/Portal.",
    );
  }
}

function checkApi(token) {
  const query = `
    query {
      me {
        username
      } 
    }
  `;

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `JWT ${token}`,
    },
    body: JSON.stringify({ query }),
  };

  fetch(ENDPOINT, options)
    .then((response) => response.json())
    .then((data) => {
      // Handle the GraphQL response data here
      console.log(data);
    })
    .catch((error) => {
      // Handle any errors that occurred during the request
      console.error("Error:", error);
    });
}

function showWaiting() {
  const el = document.getElementById("alerts");
  const msgDiv = `
    <img src="progress-bar.png">
`;
  el.innerHTML = msgDiv;
}

function showSuccessAlert() {
  const el = document.getElementById("alerts");
  const msgDiv = `<div
          class="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <strong>Done !</strong> We cloned your Banner session,
            now we'll manage it for you :)
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
          ></button>
        </div>
`;
  el.innerHTML = msgDiv;
}

function showErrorAlert(msg) {
  const el = document.getElementById("alerts");
  const msgDiv = `<div
          class="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <strong>Error!</strong> ${msg}
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
          ></button>
        </div>
`;
  el.innerHTML = msgDiv;
}
