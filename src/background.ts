chrome.omnibox.onInputEntered.addListener(async (text: string) => {
  const terms = splitInput(text);

  if (terms.length === 0) return;

  let keyword;
  let searchTerm;
  
  if (terms.length === 1) {
    // If only one word is passed in, it's the search term.
    keyword = await getDefaultKeyword();
    searchTerm = terms[0]
  } else {
    keyword = terms[0];
    searchTerm = terms.slice(1).join(" ");
  }

  chrome.storage.sync.get(["urls", "default"], async (data) => {
    const urlTemplate = data.urls?.[keyword];

    if (urlTemplate) {
      const url = urlTemplate.replace(/\{[ ]*[kK][eE][yY][ ]*\}/, searchTerm);

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
    } else {
      // Open no_match.html if no match is found
      const noMatchUrl = chrome.runtime.getURL('public/keywordNotFound.html') + `?keyword=${encodeURIComponent(keyword)}`;
      try {
        const currentTab = await getCurrentTab();
        if (currentTab?.id) {
          chrome.tabs.update(currentTab.id, { url: noMatchUrl });
        } else {
          chrome.tabs.create({ url: noMatchUrl });
        }
      } catch (error) {
        console.error("Failed to open keywordNotFound.html:", error);
      }
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


/**
 * Splits an input string into an array of substrings based on spaces, while preserving phrases enclosed in quotes.
 * 
 * This function uses a regular expression to identify and extract:
 * - Text within double quotes (e.g., "hello world")
 * - Text within single quotes (e.g., 'example')
 * - Other sequences of non-whitespace characters
 * 
 * It captures these segments and adds them to an array, which is then returned. The resulting array contains:
 * - Substrings enclosed in double quotes or single quotes as individual elements.
 * - Non-whitespace substrings that are not enclosed in quotes.
 * 
 * @param input - The input string to be split.
 * @returns An array of substrings extracted from the input string.
 */
function splitInput(input: string): string[] {
  const regex = /"([^"]+)"|'([^']+)'|[^\s]+/g;
  const matches = [];
  let match;
  while ((match = regex.exec(input)) !== null) {
    matches.push(match[1] || match[2] || match[0]);
  }
  return matches;
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: "public/onboarding.html"
    });
  }
});
