import { getUrlData } from "./utils.js";

document.getElementById("openHelp")?.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("public/onboarding.html") });
});

document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById(
    "keywordTableBody",
  ) as HTMLTableSectionElement;

  try {
    const data = await getUrlData();

    if (data && data.urls && Object.keys(data.urls).length > 0) {
      Object.entries(data.urls).forEach(([keyword, urlTemplate]) => {
        const row = document.createElement("tr");

        const keywordCell = document.createElement("td");
        keywordCell.textContent = keyword;

        const urlCell = document.createElement("td");
        urlCell.textContent = urlTemplate;

        row.appendChild(keywordCell);
        row.appendChild(urlCell);

        tableBody.appendChild(row);
      });
    } else {
      const noDataRow = document.createElement("tr");
      const noDataCell = document.createElement("td");
      noDataCell.colSpan = 2;
      noDataCell.textContent = "No keywords available.";
      noDataRow.appendChild(noDataCell);
      tableBody.appendChild(noDataRow);
    }
  } catch (error) {
    console.error("Failed to fetch keywords and URL templates:", error);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Get the URL parameters
  const params = new URLSearchParams(window.location.search);

  // Extract the keyword parameter
  const keyword = params.get("keyword");

  // Display the keyword in the appropriate place on the page
  const keywordDisplayElement = document.getElementById("keywordDisplay");
  if (keywordDisplayElement && keyword) {
    keywordDisplayElement.textContent = `"${keyword}"`;
  }
});
