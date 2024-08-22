# Quick Query Extension

Welcome to the Quick Query Chrome extension!

# Why This Extension Exists

Do you find yourself frequently typing search queries with specific keywords? The Quick Query extension is here to make your life easier! Now you can quickly configure and use URL templates to streamline your searches right from the omnibox.

<img width="450" alt="image" src="https://github.com/user-attachments/assets/c0518df5-7c3e-4824-a165-61e767e94d0c">

## Usage Instructions

After installing the extension, type `q` followed by a `keyword` and your `search term` in the address bar. If no keyword is entered, the default template is used.

The keyword must match an existing URL template; the search term will replace `{KEY}` in the URL Template. Click the extension in the top right corner to add/update URL templates.

<img width="300" alt="screenshot" src="https://github.com/user-attachments/assets/5c0f270a-1b14-4c9b-a025-b5122a8ed945">

## Examples

### Using a custom keyword:

`q myKeyword mySearchTerm`

### Using the default URL Template:

`q mySearchTerm`

### Example Use Cases:

1. Query Parameters
   `https://example.com?q={KEY}` becomes `https://example.com?q=mySearchTerm`

2. Subdomains
   `https://{KEY}.example.com` becomes `https://mySearchTerm.example.com`

# Developer Notes

We use `make` to ensure the extension files, including `manifest.json`, built scripts, and icons, are in the appropriate directories and zipped for distribution. The `Makefile` has only been tested on MacOs.

## Zip the Extension:

Creates the `tmp/` and `dist/` directories - along with a zip file used for distribution.

```bash
make
```

Delete the `tmp/` and `dist/` directories:

```bash
make clean
```

# Contributions

If you have an idea for a new feature/fix, please open a pull request or create an issue with a detailed description. I'm open to all suggestions! Thanks!
