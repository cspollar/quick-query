const getKeywordSearchTerm = async (text: string) => {
  // Ensure we always return a keyword and a searchTerm.

  const terms = splitInput(text);

  let keyword;
  let searchTerm;

  if (terms.length === 1) {
    // If only one word is passed in, it's the search term.
    keyword = await getDefaultKeyword();
    searchTerm = terms[0];
  } else {
    keyword = terms[0];
    searchTerm = terms.slice(1).join(" ");
  }
  return { keyword: keyword, searchTerm: searchTerm };
};

const EMPTY_DEFAULT_DESCRIPTION =
  "🚀 <match>[keyword]</match> [searchTerm] <url>→ [Rendered URL Template]</url>";

chrome.omnibox.onInputEntered.addListener(async (text: string) => {
  const { keyword, searchTerm } = await getKeywordSearchTerm(text);

  chrome.storage.sync.get("urls", async (urls) => {
    const urlTemplate = urls[keyword];

    if (urlTemplate) {
      const url = urlTemplate.replace(KEY_REGEX, searchTerm);

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
      const noMatchUrl =
        chrome.runtime.getURL("public/keywordNotFound.html") +
        `?keyword=${encodeURIComponent(keyword)}`;
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
      url: "public/onboarding.html",
    });
  }
});

const KEY_REGEX = /\{[ ]*[kK][eE][yY][ ]*\}/;

const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
};

chrome.omnibox.onInputStarted.addListener(function () {
  chrome.omnibox.setDefaultSuggestion({
    description: EMPTY_DEFAULT_DESCRIPTION,
  });
});

interface UrlStorage {
  urls: { [key: string]: string }; // An object where each key is a string, and the value is also a string (the URL template)
  default: string; // The default URL template
}

const getUrlDescription = (
  keyword: string,
  urlTemplate: string,
  searchTerm: string,
  regex = KEY_REGEX,
  isDefault = false,
) => {
  const escapedUrl = escapeXml(
    urlTemplate.replace(regex, encodeURIComponent(searchTerm)),
  );
  const escapedKeyword = escapeXml(keyword);
  const escapedSearchTerm = escapeXml(searchTerm);
  let description = "🚀 ";
  if (isDefault) {
    description = description + "<match>(Default)</match>";
  } else {
    description = description + `<match>${escapedKeyword}</match>`;
  }
  description =
    description + ` ${escapedSearchTerm} <url> → ${escapedUrl}</url>`;
  return description;
};

const getSuggestions = async (searchTerm: string) => {
  if (!searchTerm) {
    // Don't suggest items if there isn't a search term.
    return [];
  }

  const storageData = (await chrome.storage.sync.get([
    "urls",
    "default",
  ])) as UrlStorage;
  const urls = storageData.urls || {};

  const values = Object.entries(urls).map(([keyword, urlTemplate]) => ({
    content: `${keyword} ${searchTerm}`,
    description: getUrlDescription(keyword, urlTemplate, searchTerm),
    deletable: false,
  }));

  return values;
};

chrome.omnibox.onInputChanged.addListener(async function (text, suggest) {
  suggest(await getSuggestions(text));

  const keyword = await getDefaultKeyword();

  if (text && keyword) {
    const urlTemplate = (await chrome.storage.sync.get("urls")).urls[keyword];
    const description = getUrlDescription(
      keyword,
      urlTemplate,
      text,
      undefined,
      true,
    );
    chrome.omnibox.setDefaultSuggestion({
      description: description,
    });
  } else {
    chrome.omnibox.setDefaultSuggestion({
      description: EMPTY_DEFAULT_DESCRIPTION,
    });
  }
});
