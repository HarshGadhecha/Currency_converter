import { useState, useEffect } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { SUPPORTED_CURRENCIES } from "../services/currency.service";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return { currencies: SUPPORTED_CURRENCIES };
};

export default function CurrencySettings() {
  const { currencies } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  // Debug: Log currencies to console
  console.log("Currencies loaded:", currencies);

  // Form state - Basic Settings
  const [enabled, setEnabled] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [selectedCurrencies, setSelectedCurrencies] = useState([
    "USD",
    "EUR",
    "GBP",
    "CAD",
    "AUD",
    "JPY",
    "INR",
  ]);
  const [autoDetect, setAutoDetect] = useState(true);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(true);
  const [roundPrices, setRoundPrices] = useState(false);

  // Widget Customization - Shape and Border
  const [borderRadius, setBorderRadius] = useState("8px");
  const [borderWidth, setBorderWidth] = useState("1px");
  const [borderColor, setBorderColor] = useState("#dddddd");

  // Widget Customization - Shadow
  const [shadowEnabled, setShadowEnabled] = useState(true);
  const [shadowDepth, setShadowDepth] = useState("medium");

  // Widget Customization - Background
  const [backgroundType, setBackgroundType] = useState("solid");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundGradient, setBackgroundGradient] = useState("linear-gradient(135deg, #667eea 0%, #764ba2 100%)");
  const [themePreset, setThemePreset] = useState("light");

  // Widget Customization - Display Options
  const [displayMode, setDisplayMode] = useState("symbol");

  // Widget Customization - Theme Support
  const [themeMode, setThemeMode] = useState("auto");
  const [customLightBg, setCustomLightBg] = useState("#ffffff");
  const [customLightText, setCustomLightText] = useState("#333333");
  const [customDarkBg, setCustomDarkBg] = useState("#1a1a1a");
  const [customDarkText, setCustomDarkText] = useState("#ffffff");

  // Widget Customization - Desktop Positioning
  const [desktopPosition, setDesktopPosition] = useState("top-right");
  const [desktopCustomX, setDesktopCustomX] = useState("20px");
  const [desktopCustomY, setDesktopCustomY] = useState("20px");

  // Widget Customization - Mobile Positioning
  const [mobilePosition, setMobilePosition] = useState("bottom-fixed");
  const [mobileCustomX, setMobileCustomX] = useState("50%");
  const [mobileCustomY, setMobileCustomY] = useState("auto");
  const [mobileCompact, setMobileCompact] = useState(true);

  // Widget Customization - Advanced Styling
  const [fontSize, setFontSize] = useState("14px");
  const [padding, setPadding] = useState("12px");
  const [zIndex, setZIndex] = useState(9999);

  const isLoading = fetcher.state === "submitting";

  // Safety check: ensure currencies exist
  if (!currencies || Object.keys(currencies).length === 0) {
    return (
      <s-page heading="Currency Converter Settings">
        <s-section>
          <s-text>Loading currencies...</s-text>
        </s-section>
      </s-page>
    );
  }

  // Load settings on mount
  useEffect(() => {
    fetcher.load("/app/currency-settings");
  }, []);

  // Update form when settings are loaded
  useEffect(() => {
    if (fetcher.data?.settings) {
      const settings = fetcher.data.settings;
      // Basic settings
      setEnabled(settings.enabled);
      setBaseCurrency(settings.baseCurrency);
      setSelectedCurrencies(settings.supportedCurrencies);
      setAutoDetect(settings.autoDetect);
      setShowCurrencyPicker(settings.showCurrencyPicker);
      setRoundPrices(settings.roundPrices);

      // Widget customization
      if (settings.borderRadius) setBorderRadius(settings.borderRadius);
      if (settings.borderWidth) setBorderWidth(settings.borderWidth);
      if (settings.borderColor) setBorderColor(settings.borderColor);
      if (settings.shadowEnabled !== undefined) setShadowEnabled(settings.shadowEnabled);
      if (settings.shadowDepth) setShadowDepth(settings.shadowDepth);
      if (settings.backgroundType) setBackgroundType(settings.backgroundType);
      if (settings.backgroundColor) setBackgroundColor(settings.backgroundColor);
      if (settings.backgroundGradient) setBackgroundGradient(settings.backgroundGradient);
      if (settings.themePreset) setThemePreset(settings.themePreset);
      if (settings.displayMode) setDisplayMode(settings.displayMode);
      if (settings.themeMode) setThemeMode(settings.themeMode);
      if (settings.customLightBg) setCustomLightBg(settings.customLightBg);
      if (settings.customLightText) setCustomLightText(settings.customLightText);
      if (settings.customDarkBg) setCustomDarkBg(settings.customDarkBg);
      if (settings.customDarkText) setCustomDarkText(settings.customDarkText);
      if (settings.desktopPosition) setDesktopPosition(settings.desktopPosition);
      if (settings.desktopCustomX) setDesktopCustomX(settings.desktopCustomX);
      if (settings.desktopCustomY) setDesktopCustomY(settings.desktopCustomY);
      if (settings.mobilePosition) setMobilePosition(settings.mobilePosition);
      if (settings.mobileCustomX) setMobileCustomX(settings.mobileCustomX);
      if (settings.mobileCustomY) setMobileCustomY(settings.mobileCustomY);
      if (settings.mobileCompact !== undefined) setMobileCompact(settings.mobileCompact);
      if (settings.fontSize) setFontSize(settings.fontSize);
      if (settings.padding) setPadding(settings.padding);
      if (settings.zIndex) setZIndex(settings.zIndex);
    }
  }, [fetcher.data]);

  // Show toast on save
  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === "idle") {
      shopify.toast.show("Settings saved successfully");
    }
  }, [fetcher.data, fetcher.state, shopify]);

  const handleSave = () => {
    const formData = new FormData();
    // Basic settings
    formData.append("enabled", enabled);
    formData.append("baseCurrency", baseCurrency);
    formData.append("supportedCurrencies", selectedCurrencies.join(","));
    formData.append("autoDetect", autoDetect);
    formData.append("showCurrencyPicker", showCurrencyPicker);
    formData.append("roundPrices", roundPrices);

    // Widget customization - Shape and Border
    formData.append("borderRadius", borderRadius);
    formData.append("borderWidth", borderWidth);
    formData.append("borderColor", borderColor);

    // Widget customization - Shadow
    formData.append("shadowEnabled", shadowEnabled);
    formData.append("shadowDepth", shadowDepth);

    // Widget customization - Background
    formData.append("backgroundType", backgroundType);
    formData.append("backgroundColor", backgroundColor);
    formData.append("backgroundGradient", backgroundGradient);
    formData.append("themePreset", themePreset);

    // Widget customization - Display Options
    formData.append("displayMode", displayMode);

    // Widget customization - Theme Support
    formData.append("themeMode", themeMode);
    formData.append("customLightBg", customLightBg);
    formData.append("customLightText", customLightText);
    formData.append("customDarkBg", customDarkBg);
    formData.append("customDarkText", customDarkText);

    // Widget customization - Desktop Positioning
    formData.append("desktopPosition", desktopPosition);
    formData.append("desktopCustomX", desktopCustomX);
    formData.append("desktopCustomY", desktopCustomY);

    // Widget customization - Mobile Positioning
    formData.append("mobilePosition", mobilePosition);
    formData.append("mobileCustomX", mobileCustomX);
    formData.append("mobileCustomY", mobileCustomY);
    formData.append("mobileCompact", mobileCompact);

    // Widget customization - Advanced Styling
    formData.append("fontSize", fontSize);
    formData.append("padding", padding);
    formData.append("zIndex", zIndex);

    fetcher.submit(formData, {
      method: "POST",
      action: "/app/currency-settings",
    });
  };

  const toggleCurrency = (code) => {
    if (selectedCurrencies.includes(code)) {
      // Don't allow removing the base currency
      if (code === baseCurrency) {
        shopify.toast.show("Cannot remove base currency", { isError: true });
        return;
      }
      setSelectedCurrencies(selectedCurrencies.filter((c) => c !== code));
    } else {
      setSelectedCurrencies([...selectedCurrencies, code]);
    }
  };

  return (
    <s-page heading="Currency Converter Settings">
      <s-button
        slot="primary-action"
        onClick={handleSave}
        {...(isLoading ? { loading: true } : {})}
      >
        Save Settings
      </s-button>

      <s-section heading="General Settings">
        <s-stack direction="block" gap="base">
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              Enable Currency Converter
            </span>
          </label>

          <s-paragraph>
            When enabled, product prices will be automatically converted to the
            customer's local currency based on their location.
          </s-paragraph>
        </s-stack>
      </s-section>

      <s-section heading="Base Currency">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Select your store's base currency. All prices will be converted from
            this currency.
          </s-paragraph>

          <div style={{ marginTop: '12px' }}>
            <label htmlFor="base-currency-select" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Base Currency
            </label>
            <select
              id="base-currency-select"
              value={baseCurrency}
              onChange={(e) => {
                const newBase = e.target.value;
                setBaseCurrency(newBase);
                // Ensure base currency is in selected currencies
                if (!selectedCurrencies.includes(newBase)) {
                  setSelectedCurrencies([...selectedCurrencies, newBase]);
                }
              }}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #c9cccf',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
            >
              {Object.entries(currencies).map(([code, info]) => (
                <option key={code} value={code}>
                  {code} - {info.name} ({info.symbol})
                </option>
              ))}
            </select>
          </div>
        </s-stack>
      </s-section>

      <s-section heading="Supported Currencies">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Select which currencies you want to support. Customers will only see
            these currencies in the currency picker.
          </s-paragraph>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '12px',
            marginTop: '12px'
          }}>
            {Object.entries(currencies).map(([code, info]) => (
              <label
                key={code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  cursor: code === baseCurrency ? 'not-allowed' : 'pointer',
                  opacity: code === baseCurrency ? 0.6 : 1
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedCurrencies.includes(code)}
                  onChange={() => toggleCurrency(code)}
                  disabled={code === baseCurrency}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: code === baseCurrency ? 'not-allowed' : 'pointer'
                  }}
                />
                <span style={{ fontSize: '14px' }}>
                  {code} ({info.symbol})
                </span>
              </label>
            ))}
          </div>

          <s-text tone="subdued">
            {selectedCurrencies.length} currencies selected
          </s-text>
        </s-stack>
      </s-section>

      <s-section heading="Display Options">
        <s-stack direction="block" gap="base">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={autoDetect}
                  onChange={(e) => setAutoDetect(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  Auto-detect customer location
                </span>
              </label>
              <s-text tone="subdued">
                Automatically detect the customer's country and show prices in their
                local currency
              </s-text>
            </div>

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={showCurrencyPicker}
                  onChange={(e) => setShowCurrencyPicker(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  Show currency picker dropdown
                </span>
              </label>
              <s-text tone="subdued">
                Allow customers to manually select their preferred currency
              </s-text>
            </div>

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={roundPrices}
                  onChange={(e) => setRoundPrices(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  Round converted prices
                </span>
              </label>
              <s-text tone="subdued">
                Round prices to the nearest whole number (e.g., $19.99 becomes $20.00)
              </s-text>
            </div>
          </div>
        </s-stack>
      </s-section>

      <s-section heading="Widget Appearance">
        <s-stack direction="block" gap="large">
          <s-text variant="headingMd">Shape & Border</s-text>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="border-radius" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Border Radius
              </label>
              <input
                id="border-radius"
                type="text"
                value={borderRadius}
                onChange={(e) => setBorderRadius(e.target.value)}
                placeholder="e.g., 8px, 0px"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #c9cccf',
                  borderRadius: '8px'
                }}
              />
            </div>

            <div>
              <label htmlFor="border-width" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Border Width
              </label>
              <input
                id="border-width"
                type="text"
                value={borderWidth}
                onChange={(e) => setBorderWidth(e.target.value)}
                placeholder="e.g., 1px, 2px"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #c9cccf',
                  borderRadius: '8px'
                }}
              />
            </div>

            <div>
              <label htmlFor="border-color" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Border Color
              </label>
              <input
                id="border-color"
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '4px',
                  border: '1px solid #c9cccf',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          <s-divider />

          <s-text variant="headingMd">Shadow</s-text>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={shadowEnabled}
                onChange={(e) => setShadowEnabled(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                Enable Shadow
              </span>
            </label>

            {shadowEnabled && (
              <div>
                <label htmlFor="shadow-depth" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Shadow Depth
                </label>
                <select
                  id="shadow-depth"
                  value={shadowDepth}
                  onChange={(e) => setShadowDepth(e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #c9cccf',
                    borderRadius: '8px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="light">Light (subtle)</option>
                  <option value="medium">Medium (default)</option>
                  <option value="strong">Strong (prominent)</option>
                </select>
              </div>
            )}
          </div>
        </s-stack>
      </s-section>

      <s-section heading="Background Customization">
        <s-stack direction="block" gap="base">
          <div>
            <label htmlFor="background-type" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Background Type
            </label>
            <select
              id="background-type"
              value={backgroundType}
              onChange={(e) => setBackgroundType(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #c9cccf',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
            >
              <option value="solid">Solid Color</option>
              <option value="gradient">Gradient</option>
              <option value="theme">Theme Based</option>
            </select>
          </div>

          {backgroundType === "solid" && (
            <div>
              <label htmlFor="background-color" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Background Color
              </label>
              <input
                id="background-color"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '200px',
                  height: '40px',
                  padding: '4px',
                  border: '1px solid #c9cccf',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              />
            </div>
          )}

          {backgroundType === "gradient" && (
            <div>
              <label htmlFor="background-gradient" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                CSS Gradient
              </label>
              <input
                id="background-gradient"
                type="text"
                value={backgroundGradient}
                onChange={(e) => setBackgroundGradient(e.target.value)}
                placeholder="e.g., linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #c9cccf',
                  borderRadius: '8px'
                }}
              />
              <s-text tone="subdued">
                Example: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
              </s-text>
            </div>
          )}

          {backgroundType === "theme" && (
            <div>
              <label htmlFor="theme-preset" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Theme Preset
              </label>
              <select
                id="theme-preset"
                value={themePreset}
                onChange={(e) => setThemePreset(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #c9cccf',
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          )}
        </s-stack>
      </s-section>

      <s-section heading="Currency Display Mode">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Choose how currencies are displayed in the selector
          </s-paragraph>

          <div>
            <label htmlFor="display-mode" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Display Mode
            </label>
            <select
              id="display-mode"
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #c9cccf',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
            >
              <option value="symbol">Currency Symbol Only (e.g., $, €, £)</option>
              <option value="flag">Flag Only (e.g., 🇺🇸, 🇪🇺, 🇬🇧)</option>
              <option value="flag-symbol">Flag + Symbol (e.g., 🇺🇸 $)</option>
            </select>
          </div>
        </s-stack>
      </s-section>

      <s-section heading="Theme Support">
        <s-stack direction="block" gap="base">
          <div>
            <label htmlFor="theme-mode" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Theme Mode
            </label>
            <select
              id="theme-mode"
              value={themeMode}
              onChange={(e) => setThemeMode(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #c9cccf',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
            >
              <option value="auto">Auto-detect (recommended)</option>
              <option value="light">Always Light</option>
              <option value="dark">Always Dark</option>
              <option value="custom">Custom Colors</option>
            </select>
          </div>

          {themeMode === "custom" && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
              <div>
                <label htmlFor="custom-light-bg" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Light Mode Background
                </label>
                <input
                  id="custom-light-bg"
                  type="color"
                  value={customLightBg}
                  onChange={(e) => setCustomLightBg(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '4px',
                    border: '1px solid #c9cccf',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div>
                <label htmlFor="custom-light-text" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Light Mode Text
                </label>
                <input
                  id="custom-light-text"
                  type="color"
                  value={customLightText}
                  onChange={(e) => setCustomLightText(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '4px',
                    border: '1px solid #c9cccf',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div>
                <label htmlFor="custom-dark-bg" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Dark Mode Background
                </label>
                <input
                  id="custom-dark-bg"
                  type="color"
                  value={customDarkBg}
                  onChange={(e) => setCustomDarkBg(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '4px',
                    border: '1px solid #c9cccf',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div>
                <label htmlFor="custom-dark-text" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Dark Mode Text
                </label>
                <input
                  id="custom-dark-text"
                  type="color"
                  value={customDarkText}
                  onChange={(e) => setCustomDarkText(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '4px',
                    border: '1px solid #c9cccf',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          )}
        </s-stack>
      </s-section>

      <s-section heading="Desktop Positioning">
        <s-stack direction="block" gap="base">
          <div>
            <label htmlFor="desktop-position" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Position Preset
            </label>
            <select
              id="desktop-position"
              value={desktopPosition}
              onChange={(e) => setDesktopPosition(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #c9cccf',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
            >
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="custom">Custom Position</option>
            </select>
          </div>

          {desktopPosition === "custom" && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
              <div>
                <label htmlFor="desktop-x" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Horizontal Position (X)
                </label>
                <input
                  id="desktop-x"
                  type="text"
                  value={desktopCustomX}
                  onChange={(e) => setDesktopCustomX(e.target.value)}
                  placeholder="e.g., 20px, 10%"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #c9cccf',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div>
                <label htmlFor="desktop-y" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Vertical Position (Y)
                </label>
                <input
                  id="desktop-y"
                  type="text"
                  value={desktopCustomY}
                  onChange={(e) => setDesktopCustomY(e.target.value)}
                  placeholder="e.g., 20px, 10%"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #c9cccf',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>
          )}
        </s-stack>
      </s-section>

      <s-section heading="Mobile Positioning">
        <s-stack direction="block" gap="base">
          <div>
            <label htmlFor="mobile-position" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Position Preset
            </label>
            <select
              id="mobile-position"
              value={mobilePosition}
              onChange={(e) => setMobilePosition(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #c9cccf',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
            >
              <option value="bottom-fixed">Bottom Fixed Bar</option>
              <option value="top-fixed">Top Fixed Bar</option>
              <option value="floating">Floating Button</option>
              <option value="custom">Custom Position</option>
            </select>
          </div>

          {mobilePosition === "custom" && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
              <div>
                <label htmlFor="mobile-x" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Horizontal Position (X)
                </label>
                <input
                  id="mobile-x"
                  type="text"
                  value={mobileCustomX}
                  onChange={(e) => setMobileCustomX(e.target.value)}
                  placeholder="e.g., 50%, 10px"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #c9cccf',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div>
                <label htmlFor="mobile-y" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Vertical Position (Y)
                </label>
                <input
                  id="mobile-y"
                  type="text"
                  value={mobileCustomY}
                  onChange={(e) => setMobileCustomY(e.target.value)}
                  placeholder="e.g., auto, 20px"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #c9cccf',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>
          )}

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            marginTop: '12px'
          }}>
            <input
              type="checkbox"
              checked={mobileCompact}
              onChange={(e) => setMobileCompact(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              Use Compact Mobile Design
            </span>
          </label>
          <s-text tone="subdued">
            Compact design shows a smaller, icon-based selector on mobile devices
          </s-text>
        </s-stack>
      </s-section>

      <s-section heading="Advanced Styling">
        <s-stack direction="block" gap="base">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="font-size" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Font Size
              </label>
              <input
                id="font-size"
                type="text"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                placeholder="e.g., 14px"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #c9cccf',
                  borderRadius: '8px'
                }}
              />
            </div>

            <div>
              <label htmlFor="padding" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Padding
              </label>
              <input
                id="padding"
                type="text"
                value={padding}
                onChange={(e) => setPadding(e.target.value)}
                placeholder="e.g., 12px"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #c9cccf',
                  borderRadius: '8px'
                }}
              />
            </div>

            <div>
              <label htmlFor="z-index" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Z-Index
              </label>
              <input
                id="z-index"
                type="number"
                value={zIndex}
                onChange={(e) => setZIndex(Number(e.target.value))}
                placeholder="e.g., 9999"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #c9cccf',
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="How it works">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            The Currency Converter app automatically detects your customer's
            location and converts product prices to their local currency using
            real-time exchange rates.
          </s-paragraph>

          <s-paragraph>
            <strong>Features:</strong>
          </s-paragraph>

          <s-unordered-list>
            <s-list-item>Real-time currency conversion</s-list-item>
            <s-list-item>Automatic location detection</s-list-item>
            <s-list-item>Manual currency selector</s-list-item>
            <s-list-item>20+ supported currencies</s-list-item>
            <s-list-item>Cached rates for performance</s-list-item>
          </s-unordered-list>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Setup Instructions">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            <strong>Step 1:</strong> Enable the currency converter and select
            your base currency
          </s-paragraph>

          <s-paragraph>
            <strong>Step 2:</strong> Choose which currencies to support
          </s-paragraph>

          <s-paragraph>
            <strong>Step 3:</strong> Configure display options
          </s-paragraph>

          <s-paragraph>
            <strong>Step 4:</strong> Install the app extension on your theme
          </s-paragraph>

          <s-paragraph tone="subdued">
            The currency converter will automatically appear on your storefront
            after installation.
          </s-paragraph>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
