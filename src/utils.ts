type UrlData = {
  urls: Record<string, string>;
  default: string;
};

export const getUrlData = (): Promise<UrlData | null> => {
  try {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["urls", "default"], (items) =>
        resolve(items as UrlData),
      );
    });
  } catch {
    return new Promise(() => null);
  }
};
