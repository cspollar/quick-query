# Variables
JS_DIR = js
DIST_DIR = dist
TEMP_DIR = tmp
ZIP_FILE = $(DIST_DIR)/quick-query.zip
MANIFEST_FILE = manifest.json
ICONS_DIR = icons
PUBLIC_DIR = public

# Targets
.PHONY: all clean zip

# Default target
all: zip

# Create a ZIP archive of the extension
zip: clean
	@echo "Install requirements"
	@npm install

	@echo "Compiling the Typescript"
	@mkdir -p $(JS_DIR)
	@npm run compile

	@echo "Preparing temporary directory..."
	@mkdir -p $(TEMP_DIR)
	@cp -r $(JS_DIR) $(TEMP_DIR)
	@cp -r $(PUBLIC_DIR) $(TEMP_DIR)
	@cp $(MANIFEST_FILE) $(TEMP_DIR)
	@cp -r $(ICONS_DIR) $(TEMP_DIR)
	@echo "Files copied to temporary directory."

	@echo "Creating the $(DIST_DIR) directory"
	@mkdir -p $(DIST_DIR)
	@echo "Creating ZIP archive..."
	@zip -r $(ZIP_FILE) $(TEMP_DIR)
	@echo "ZIP archive created: $(ZIP_FILE)"

# Clean up temporary directory and ZIP file
clean:
	@echo "Cleaning up..."
	@rm -rf $(TEMP_DIR)
	@rm -rf $(JS_DIR)
	@rm -rf $(DIST_DIR)
	@echo "Clean up complete."
