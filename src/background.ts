chrome.omnibox.onInputEntered.addListener(async (text: string) => {
  const [keywordOrSearchTerm, searchTermIfExists] = text.split(" ");
  const searchTerm = searchTermIfExists || keywordOrSearchTerm;
  const keyword = searchTermIfExists
    ? keywordOrSearchTerm
    : await getDefaultKeyword();

  chrome.storage.sync.get(["urls", "default"], async (data) => {
    const urlTemplate = data.urls[keyword] || "https://example.com?q={KEY}";
    const url = urlTemplate.replace(
      /\{[ ]*[kK][eE][yY][ ]*\}/,
      searchTerm || "",
    );

    try {
      const currentTab = await getCurrentTab();
      if (currentTab?.id) {
        chrome.tabs.update(currentTab.id, { url });
      } else {
        chrome.tabs.create({ url });
      }
    } catch (error) {
      console.error("Failed to update or create tab:", error);
    }
  });
});

async function getDefaultKeyword(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.sync.get("default", (items) => {
      resolve(items.default || "");
    });
  });
}

async function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
