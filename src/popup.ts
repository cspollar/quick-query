import { getUrlData } from "./utils.js";

const updateUrlList = async (): Promise<void> => {
  try {
    const data = await getUrlData();
    if (!data) {
      // Chrome doesn't have any data stored yet
      return;
    }
    const urlList = document.getElementById("urlList") as HTMLElement;
    const urlListPlaceholder = document.getElementById(
      "urlListPlaceholder",
    ) as HTMLElement;

    urlList.innerHTML = "";
    urlListPlaceholder.style.display =
      data.urls && Object.keys(data.urls).length ? "none" : "inherit";

    if (!data.urls || Object.keys(data.urls).length === 0) return;

    for (const [keyword, url] of Object.entries(data.urls)) {
      if (!data.urls[data.default]) data.default = keyword;

      const div = createUrlItem(keyword, url, data.default);
      urlList.appendChild(div);
      const keywordInput = document.getElementById(
        "keyword",
      ) as HTMLInputElement;
      keywordInput.value = "";
      const urlInput = document.getElementById("url") as HTMLInputElement;
      urlInput.value = "";
    }
  } catch (error) {
    console.error("Failed to update URL list:", error);
  }
};

const createUrlItem = (
  keyword: string,
  url: string,
  defaultKeyword?: string,
): HTMLElement => {
  const div = document.createElement("div");
  div.className = "url-item";

  const radio = document.createElement("input");
  radio.type = "radio";
  radio.id = keyword;
  radio.name = "defaultUrl";
  if (keyword === defaultKeyword || !defaultKeyword) {
    radio.checked = true;
    chrome.storage.sync.set({ default: keyword });
  }

  radio.addEventListener("click", () => {
    chrome.storage.sync.set({ default: keyword }, updateUrlList);
  });

  const label = document.createElement("label");
  label.classList.add("urlLabel");
  label.htmlFor = keyword;

  const keywordDiv = document.createElement("div");
  keywordDiv.className = "keywordWrapper";
  keywordDiv.innerText = keyword;

  const urlDiv = document.createElement("div");
  urlDiv.className = "urlWrapper";
  urlDiv.innerText = url;

  label.appendChild(keywordDiv);
  label.appendChild(urlDiv);

  if (keyword === defaultKeyword) {
    keywordDiv.classList.add("defaultSelection");
  }

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "✖";
  deleteButton.addEventListener("click", async () => {
    try {
      const items = await getUrlData();
      const urls = { ...items?.urls };
      console.log("urls80", urls);
      delete urls[keyword];
      chrome.storage.sync.set({ urls }, updateUrlList);
    } catch (error) {
      console.error("Failed to delete URL:", error);
    }
  });

  div.appendChild(radio);
  div.appendChild(label);
  div.appendChild(deleteButton);

  return div;
};

const addUrl = async (): Promise<void> => {
  const keywordInput = document.getElementById("keyword") as HTMLInputElement;
  const urlInput = document.getElementById("url") as HTMLInputElement;

  const keyword = keywordInput.value.trim();
  const url = urlInput.value.trim();

  const keyPattern = /\{[ ]*[kK][eE][yY][ ]*\}/;

  if (!keyword) {
    alert("Enter a keyword to use when searching");
    return;
  }

  if (!keyPattern.test(url)) {
    alert("The URL template must contain a valid {KEY} placeholder.");
    return;
  }

  const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
  if (!urlPattern.test(url)) {
    alert("The URL template must be a valid URL.");
    return;
  }

  try {
    const items = await getUrlData();
    const urls = { ...items?.urls, [keyword]: url };
    chrome.storage.sync.set({ urls }, updateUrlList);
  } catch (error) {
    console.error("Failed to add/update URL:", error);
  }
};

document.getElementById("addUrl")?.addEventListener("click", addUrl);

document.getElementById("openOnboarding")?.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("public/onboarding.html") });
});

updateUrlList();
