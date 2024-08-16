function updateUrlList() {
    chrome.storage.sync.get(["urls", "default"], (data) => {
        const urlList = document.getElementById('urlList');
        const urlListPlaceholder = document.getElementById('urlListPlaceholder');
        urlList.innerHTML = '';
        urlListPlaceholder.style.display = "none";

        if (!data.urls || Object.keys(data.urls).length === 0) {
            urlList.textContent = "";
            urlListPlaceholder.style.display = "inherit";
            return;
        }

        for (const [keyword, url] of Object.entries(data.urls)) {
            console.log('data.urls[data.default]', data.urls[data.default])
            console.log('data.urls', data.urls)
            console.log('data.default', data.default)
            if (!data.urls[data.default]) {
                // Ensure there is always a default
                data.default = keyword;
            }
            const div = document.createElement('div');
            div.className = 'url-item';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = keyword;
            radio.name = 'defaultUrl';
            radio.checked = (keyword === data.default);

            radio.addEventListener('click', () => {
                chrome.storage.sync.set({ default: keyword }, () => {
                    updateUrlList();
                });
            });

            // Create the label element
            const label = document.createElement('label');
            label.classList.add('urlLabel');

            // Create the div to wrap the keyword
            const keywordDiv = document.createElement('div');
            keywordDiv.classList.add('keywordWrapper');
            keywordDiv.innerText = keyword;

            // Create another div for the URL
            const urlDiv = document.createElement('div');
            urlDiv.classList.add('urlWrapper');
            urlDiv.innerText = url;

            // Append the keyword and URL divs to the label
            label.appendChild(keywordDiv);
            label.appendChild(urlDiv);

            // Set the 'for' attribute of the label
            label.htmlFor = keyword;

            // Conditional class addition based on the default keyword
            if (keyword === data.default) {
                keywordDiv.classList.add('defaultSelection');
            }


            const deleteButton = document.createElement('button');
            deleteButton.textContent = '✖';
            deleteButton.addEventListener('click', () => {
                chrome.storage.sync.get("urls", (data) => {
                    const urls = data.urls;
                    delete urls[keyword];
                    chrome.storage.sync.set({ urls: urls }, () => {
                        updateUrlList();
                    });
                });
            });

            div.appendChild(radio);
            div.appendChild(label);
            div.appendChild(deleteButton);
            urlList.appendChild(div);
        }
    });
}

document.getElementById('addUrl').addEventListener('click', () => {
    const keyword = document.getElementById('keyword').value.trim();
    const url = document.getElementById('url').value.trim();

    // Matches {KEY}, {key}, { key }, etc.
    const keyPattern = /\{[ ]*[kK][eE][yY][ ]*\}/;

    if (!keyword) {
        alert("Enter a keyword to use when searching");
        return;
    }
    
    if (!keyPattern.test(url)) {
        alert("The URL template must contain a valid {KEY} placeholder.");
        return;
    }

    // Basic URL validation
    const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
    if (!urlPattern.test(url)) {
        alert("The URL template must be a valid URL.");
        return;
    }


    if (url) {
        chrome.storage.sync.get("urls", (data) => {
            const urls = data.urls || {};
            urls[keyword] = url;
            chrome.storage.sync.set({ urls: urls }, () => {
                updateUrlList();
            });
        });
    } else {
        alert("Please enter a URL template.");
    }
});

updateUrlList();
