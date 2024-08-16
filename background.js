chrome.omnibox.onInputEntered.addListener((text) => {
    const parts = text.split(' ');
    let keywordOrSearchTerm = parts[0];
    let searchTermIfExists = parts[1];
    let keyword;
    let searchTerm;

    chrome.storage.sync.get(["urls", "default"], async (data) => {

        if (!searchTermIfExists) {
            // If no search term is provided, assume keywordOrSearchTerm is the search term
            searchTerm = keywordOrSearchTerm;
            keyword = data.default
        } else {
            keyword = keywordOrSearchTerm;
            searchTerm = searchTermIfExists;
        }

        // Get template or use demo
        const urlTemplate = data.urls[keyword] || 'https://example.com?q={KEY}';

        const url = urlTemplate.replace(/\{[ ]*[kK][eE][yY][ ]*\}/, searchTerm || "");
        // Get the current active tab
        let currentTab = await getCurrentTab();
        if (currentTab) {
            // Update the current tab with the new URL
            chrome.tabs.update(currentTab.id, { url: url });
        } else {
            chrome.tabs.create({ url: url });
        }
    });
});

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}