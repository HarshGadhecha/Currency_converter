/**
 * Currency Converter - Storefront Script
 * Automatically converts prices based on customer location
 */

(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    API_ENDPOINT: window.location.origin + "/api/exchange-rates",
    STORAGE_KEY: "selected_currency",
    DEFAULT_CURRENCY: "USD",
    CACHE_DURATION: 60 * 60 * 1000, // 1 hour
  };

  // Currency symbols mapping
  const CURRENCY_SYMBOLS = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "C$",
    AUD: "A$",
    JPY: "¥",
    INR: "₹",
    CNY: "¥",
    CHF: "CHF",
    SEK: "kr",
    NZD: "NZ$",
    MXN: "MX$",
    SGD: "S$",
    HKD: "HK$",
    NOK: "kr",
    KRW: "₩",
    TRY: "₺",
    RUB: "₽",
    BRL: "R$",
    ZAR: "R",
  };

  // Currency flag emojis mapping
  const CURRENCY_FLAGS = {
    USD: "🇺🇸",
    EUR: "🇪🇺",
    GBP: "🇬🇧",
    CAD: "🇨🇦",
    AUD: "🇦🇺",
    JPY: "🇯🇵",
    INR: "🇮🇳",
    CNY: "🇨🇳",
    CHF: "🇨🇭",
    SEK: "🇸🇪",
    NZD: "🇳🇿",
    MXN: "🇲🇽",
    SGD: "🇸🇬",
    HKD: "🇭🇰",
    NOK: "🇳🇴",
    KRW: "🇰🇷",
    TRY: "🇹🇷",
    RUB: "🇷🇺",
    BRL: "🇧🇷",
    ZAR: "🇿🇦",
  };

  // Country to currency mapping
  const COUNTRY_TO_CURRENCY = {
    US: "USD",
    CA: "CAD",
    GB: "GBP",
    AU: "AUD",
    NZ: "NZD",
    IN: "INR",
    JP: "JPY",
    CN: "CNY",
    DE: "EUR",
    FR: "EUR",
    IT: "EUR",
    ES: "EUR",
    NL: "EUR",
    BE: "EUR",
    AT: "EUR",
    IE: "EUR",
    PT: "EUR",
    FI: "EUR",
    GR: "EUR",
    CH: "CHF",
    SE: "SEK",
    NO: "NOK",
    MX: "MXN",
    SG: "SGD",
    HK: "HKD",
    KR: "KRW",
    TR: "TRY",
    RU: "RUB",
    BR: "BRL",
    ZA: "ZAR",
  };

  // State
  let state = {
    baseCurrency: CONFIG.DEFAULT_CURRENCY,
    currentCurrency: null,
    exchangeRates: {},
    originalPrices: new Map(),
    isInitialized: false,
    widgetSettings: null, // Will be loaded from API
  };

  /**
   * Get user's country using geolocation API
   */
  async function detectUserCountry() {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      return data.country_code;
    } catch (error) {
      console.error("Error detecting country:", error);
      return null;
    }
  }

  /**
   * Fetch widget settings from API
   */
  async function fetchWidgetSettings() {
    try {
      const response = await fetch(window.location.origin + "/app/currency-settings");
      const data = await response.json();
      if (data.success && data.settings) {
        return data.settings;
      }
    } catch (error) {
      console.error("Error fetching widget settings:", error);
    }
    return null;
  }

  /**
   * Detect if user prefers dark mode
   */
  function isDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Get shadow CSS based on settings
   */
  function getShadowCSS(settings) {
    if (!settings.shadowEnabled) {
      return 'none';
    }
    const shadows = {
      light: '0 1px 3px rgba(0,0,0,0.1)',
      medium: '0 2px 8px rgba(0,0,0,0.1)',
      strong: '0 4px 16px rgba(0,0,0,0.15)'
    };
    return shadows[settings.shadowDepth] || shadows.medium;
  }

  /**
   * Get background CSS based on settings and theme
   */
  function getBackgroundCSS(settings) {
    if (settings.backgroundType === 'gradient') {
      return settings.backgroundGradient;
    }
    if (settings.backgroundType === 'theme') {
      if (settings.themeMode === 'auto') {
        return isDarkMode() ? settings.customDarkBg : settings.customLightBg;
      }
      if (settings.themeMode === 'dark') {
        return settings.customDarkBg;
      }
      if (settings.themeMode === 'custom') {
        return isDarkMode() ? settings.customDarkBg : settings.customLightBg;
      }
      return settings.customLightBg;
    }
    return settings.backgroundColor;
  }

  /**
   * Get text color based on settings and theme
   */
  function getTextColor(settings) {
    if (settings.backgroundType === 'theme' || settings.themeMode !== 'light') {
      if (settings.themeMode === 'auto') {
        return isDarkMode() ? settings.customDarkText : settings.customLightText;
      }
      if (settings.themeMode === 'dark') {
        return settings.customDarkText;
      }
      if (settings.themeMode === 'custom') {
        return isDarkMode() ? settings.customDarkText : settings.customLightText;
      }
      return settings.customLightText;
    }
    // For solid/gradient backgrounds, calculate contrasting color
    return '#333333';
  }

  /**
   * Get position CSS based on settings and screen size
   */
  function getPositionCSS(settings) {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      const positionMap = {
        'bottom-fixed': { position: 'fixed', bottom: '0', left: '50%', transform: 'translateX(-50%)', width: '100%' },
        'top-fixed': { position: 'fixed', top: '0', left: '50%', transform: 'translateX(-50%)', width: '100%' },
        'floating': { position: 'fixed', bottom: '20px', right: '20px' },
        'custom': { position: 'fixed', left: settings.mobileCustomX, top: settings.mobileCustomY }
      };
      return positionMap[settings.mobilePosition] || positionMap['bottom-fixed'];
    } else {
      const positionMap = {
        'top-right': { position: 'fixed', top: settings.desktopCustomY, right: settings.desktopCustomX },
        'top-left': { position: 'fixed', top: settings.desktopCustomY, left: settings.desktopCustomX },
        'bottom-right': { position: 'fixed', bottom: settings.desktopCustomY, right: settings.desktopCustomX },
        'bottom-left': { position: 'fixed', bottom: settings.desktopCustomY, left: settings.desktopCustomX },
        'custom': { position: 'fixed', left: settings.desktopCustomX, top: settings.desktopCustomY }
      };
      return positionMap[settings.desktopPosition] || positionMap['top-right'];
    }
  }

  /**
   * Get currency display text based on display mode
   */
  function getCurrencyDisplay(code, settings) {
    const symbol = CURRENCY_SYMBOLS[code] || code;
    const flag = CURRENCY_FLAGS[code] || '';

    switch (settings.displayMode) {
      case 'flag':
        return `${flag} ${code}`;
      case 'flag-symbol':
        return `${flag} ${symbol} ${code}`;
      case 'symbol':
      default:
        return `${symbol} ${code}`;
    }
  }

  /**
   * Get currency from localStorage or detect it
   */
  async function getPreferredCurrency() {
    // Check localStorage first
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (stored) {
      return stored;
    }

    // Detect from country
    const country = await detectUserCountry();
    if (country && COUNTRY_TO_CURRENCY[country]) {
      return COUNTRY_TO_CURRENCY[country];
    }

    return state.baseCurrency;
  }

  /**
   * Fetch exchange rates from API
   */
  async function fetchExchangeRates() {
    try {
      const response = await fetch(
        `${CONFIG.API_ENDPOINT}?base=${state.baseCurrency}`
      );
      const data = await response.json();

      if (data.success) {
        state.exchangeRates = data.rates;
        return data.rates;
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
    return null;
  }

  /**
   * Extract numeric price from string
   */
  function extractPrice(priceText) {
    // Remove currency symbols and non-numeric characters except . and ,
    const cleaned = priceText.replace(/[^\d.,]/g, "");
    // Handle different decimal separators
    const normalized = cleaned.replace(/,/g, ".");
    return parseFloat(normalized);
  }

  /**
   * Format price with currency symbol
   */
  function formatPrice(amount, currency) {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formatted = amount.toFixed(2);

    // Some currencies place symbol after amount
    if (["EUR", "SEK", "NOK"].includes(currency)) {
      return `${formatted}${symbol}`;
    }

    return `${symbol}${formatted}`;
  }

  /**
   * Convert price to target currency
   */
  function convertPrice(amount, targetCurrency) {
    if (targetCurrency === state.baseCurrency) {
      return amount;
    }

    const rate = state.exchangeRates[targetCurrency];
    if (!rate) {
      return amount;
    }

    return amount * rate;
  }

  /**
   * Find all price elements on the page
   */
  function findPriceElements() {
    const selectors = [
      ".price",
      ".money",
      "[data-price]",
      ".product-price",
      ".product__price",
      ".price__current",
      ".price-item",
      'span[class*="price"]',
      'div[class*="price"]',
    ];

    const elements = [];
    selectors.forEach((selector) => {
      const found = document.querySelectorAll(selector);
      found.forEach((el) => {
        // Skip if element is hidden or already processed
        if (
          el.offsetParent === null ||
          el.hasAttribute("data-currency-converted")
        ) {
          return;
        }
        elements.push(el);
      });
    });

    return elements;
  }

  /**
   * Convert all prices on the page
   */
  function convertAllPrices(targetCurrency) {
    const priceElements = findPriceElements();

    priceElements.forEach((element) => {
      // Store original price if not already stored
      if (!state.originalPrices.has(element)) {
        state.originalPrices.set(element, {
          text: element.textContent,
          price: extractPrice(element.textContent),
        });
      }

      const original = state.originalPrices.get(element);
      const convertedAmount = convertPrice(original.price, targetCurrency);
      const formattedPrice = formatPrice(convertedAmount, targetCurrency);

      element.textContent = formattedPrice;
      element.setAttribute("data-currency-converted", targetCurrency);
    });

    state.currentCurrency = targetCurrency;
  }

  /**
   * Create currency selector dropdown with customization
   */
  function createCurrencyPicker() {
    // Check if picker already exists
    if (document.getElementById("currency-converter-picker")) {
      return;
    }

    const settings = state.widgetSettings;
    if (!settings) {
      console.error("Widget settings not loaded");
      return;
    }

    const availableCurrencies = Object.keys(CURRENCY_SYMBOLS);
    const position = getPositionCSS(settings);
    const background = getBackgroundCSS(settings);
    const textColor = getTextColor(settings);
    const shadow = getShadowCSS(settings);
    const isMobile = window.innerWidth <= 768;

    // Build position styles
    const positionStyles = Object.entries(position)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');

    // Build compact mobile styles if needed
    const compactStyles = isMobile && settings.mobileCompact ? `
      max-width: 200px;
    ` : '';

    const pickerHTML = `
      <div id="currency-converter-picker" style="
        ${positionStyles};
        z-index: ${settings.zIndex};
        background: ${background};
        border: ${settings.borderWidth} solid ${settings.borderColor};
        border-radius: ${settings.borderRadius};
        padding: ${settings.padding};
        box-shadow: ${shadow};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ${compactStyles}
        transition: all 0.3s ease;
      ">
        <label for="currency-select" style="
          display: block;
          font-size: calc(${settings.fontSize} * 0.85);
          font-weight: 600;
          margin-bottom: 6px;
          color: ${textColor};
        ">
          Currency
        </label>
        <select id="currency-select" style="
          width: 100%;
          min-width: ${isMobile && settings.mobileCompact ? '150px' : '120px'};
          padding: 6px 8px;
          border: 1px solid ${settings.borderColor};
          border-radius: calc(${settings.borderRadius} / 2);
          font-size: ${settings.fontSize};
          cursor: pointer;
          background: ${background};
          color: ${textColor};
        ">
          ${availableCurrencies
            .map(
              (code) => `
            <option value="${code}" ${code === state.currentCurrency ? "selected" : ""}>
              ${getCurrencyDisplay(code, settings)}
            </option>
          `
            )
            .join("")}
        </select>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", pickerHTML);

    // Add event listener
    const select = document.getElementById("currency-select");
    select.addEventListener("change", async (e) => {
      const newCurrency = e.target.value;
      await changeCurrency(newCurrency);
    });

    // Add resize listener to update position on screen size change
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updatePickerPosition();
      }, 250);
    });

    // Listen for theme changes
    if (settings.themeMode === 'auto') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        updatePickerStyles();
      });
    }
  }

  /**
   * Update picker position on resize
   */
  function updatePickerPosition() {
    const picker = document.getElementById("currency-converter-picker");
    if (!picker || !state.widgetSettings) return;

    const position = getPositionCSS(state.widgetSettings);
    Object.entries(position).forEach(([key, value]) => {
      picker.style[key] = value;
    });
  }

  /**
   * Update picker styles (for theme changes)
   */
  function updatePickerStyles() {
    const picker = document.getElementById("currency-converter-picker");
    const select = document.getElementById("currency-select");
    if (!picker || !select || !state.widgetSettings) return;

    const settings = state.widgetSettings;
    const background = getBackgroundCSS(settings);
    const textColor = getTextColor(settings);

    picker.style.background = background;
    select.style.background = background;
    select.style.color = textColor;

    const label = picker.querySelector('label');
    if (label) {
      label.style.color = textColor;
    }
  }

  /**
   * Change currency and update all prices
   */
  async function changeCurrency(newCurrency) {
    // Save to localStorage
    localStorage.setItem(CONFIG.STORAGE_KEY, newCurrency);

    // Convert all prices
    convertAllPrices(newCurrency);

    // Update picker if it exists
    const select = document.getElementById("currency-select");
    if (select) {
      select.value = newCurrency;
    }
  }

  /**
   * Initialize the currency converter
   */
  async function initialize() {
    if (state.isInitialized) {
      return;
    }

    console.log("Initializing Currency Converter...");

    // Fetch widget settings first
    const settings = await fetchWidgetSettings();
    if (settings) {
      state.widgetSettings = settings;
      console.log("Widget settings loaded:", settings);
    } else {
      // Use default settings if API fails
      state.widgetSettings = {
        borderRadius: "8px",
        borderWidth: "1px",
        borderColor: "#dddddd",
        shadowEnabled: true,
        shadowDepth: "medium",
        backgroundType: "solid",
        backgroundColor: "#ffffff",
        displayMode: "symbol",
        themeMode: "auto",
        customLightBg: "#ffffff",
        customLightText: "#333333",
        customDarkBg: "#1a1a1a",
        customDarkText: "#ffffff",
        desktopPosition: "top-right",
        desktopCustomX: "20px",
        desktopCustomY: "20px",
        mobilePosition: "bottom-fixed",
        mobileCustomX: "50%",
        mobileCustomY: "auto",
        mobileCompact: true,
        fontSize: "14px",
        padding: "12px",
        zIndex: 9999,
      };
      console.log("Using default widget settings");
    }

    // Fetch exchange rates
    const rates = await fetchExchangeRates();
    if (!rates) {
      console.error("Failed to fetch exchange rates");
      return;
    }

    // Get preferred currency
    const preferredCurrency = await getPreferredCurrency();
    console.log("Preferred currency:", preferredCurrency);

    // Create currency picker
    createCurrencyPicker();

    // Convert prices
    convertAllPrices(preferredCurrency);

    state.isInitialized = true;

    // Watch for dynamic content changes
    observeDOMChanges();
  }

  /**
   * Observe DOM changes to convert dynamically loaded prices
   */
  function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      // Debounce price conversion
      clearTimeout(observer.timeout);
      observer.timeout = setTimeout(() => {
        if (state.currentCurrency) {
          convertAllPrices(state.currentCurrency);
        }
      }, 500);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // Expose API for external use
  window.CurrencyConverter = {
    changeCurrency,
    getCurrentCurrency: () => state.currentCurrency,
    getSupportedCurrencies: () => Object.keys(CURRENCY_SYMBOLS),
  };
})();
