SCHEME = Milliways
PROJECT = Milliways.xcodeproj
BUILD_DIR = build
DEVICE_NAME = iPhone 17 Pro
DEVICE_ID = $(shell xcrun simctl list devices available | grep "$(DEVICE_NAME) " | head -1 | awk -F '[()]' '{print $$2}')
APP_PATH = $(BUILD_DIR)/Build/Products/Debug-iphonesimulator/$(SCHEME).app
ARCHIVE_PATH = $(BUILD_DIR)/$(SCHEME).xcarchive
IPA_DIR = $(BUILD_DIR)/ipa

.PHONY: build install run clean boot ipa zip test

build:
	xcodebuild \
		-project $(PROJECT) \
		-scheme $(SCHEME) \
		-configuration Debug \
		-destination "platform=iOS Simulator,name=$(DEVICE_NAME)" \
		-derivedDataPath $(BUILD_DIR) \
		build

boot:
	xcrun simctl boot "$(DEVICE_ID)" 2>/dev/null || true
	open -a Simulator

install: build boot
	xcrun simctl install "$(DEVICE_ID)" "$(APP_PATH)"

run: install
	xcrun simctl launch "$(DEVICE_ID)" $(shell defaults read "$(CURDIR)/$(APP_PATH)/Info.plist" CFBundleIdentifier)

zip: build
	cd $(BUILD_DIR)/Build/Products/Debug-iphonesimulator && zip -r $(CURDIR)/$(BUILD_DIR)/$(SCHEME)-simulator.zip $(SCHEME).app
	@echo "Created $(BUILD_DIR)/$(SCHEME)-simulator.zip"

ipa:
	xcodebuild archive \
		-project $(PROJECT) \
		-scheme $(SCHEME) \
		-configuration Debug \
		-destination "generic/platform=iOS" \
		-archivePath $(ARCHIVE_PATH) \
		CODE_SIGN_IDENTITY="" \
		CODE_SIGNING_REQUIRED=NO \
		CODE_SIGNING_ALLOWED=NO
	mkdir -p $(IPA_DIR)/Payload
	cp -r $(ARCHIVE_PATH)/Products/Applications/$(SCHEME).app $(IPA_DIR)/Payload/
	cd $(IPA_DIR) && zip -r ../$(SCHEME)-unsigned.ipa Payload
	rm -rf $(IPA_DIR)
	@echo "Created $(BUILD_DIR)/$(SCHEME)-unsigned.ipa"

test:
	npm init -y && npm install mobilewright && npx mobilewright test

clean:
	xcodebuild \
		-project $(PROJECT) \
		-scheme $(SCHEME) \
		-configuration Debug \
		-derivedDataPath $(BUILD_DIR) \
		clean
	rm -rf $(BUILD_DIR)
