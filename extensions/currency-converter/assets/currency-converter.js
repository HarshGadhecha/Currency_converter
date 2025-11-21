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
   * Create currency selector dropdown
   */
  function createCurrencyPicker() {
    // Check if picker already exists
    if (document.getElementById("currency-converter-picker")) {
      return;
    }

    const availableCurrencies = Object.keys(CURRENCY_SYMBOLS);

    const pickerHTML = `
      <div id="currency-converter-picker" style="
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <label for="currency-select" style="
          display: block;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 6px;
          color: #333;
        ">
          Currency
        </label>
        <select id="currency-select" style="
          width: 120px;
          padding: 6px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          background: white;
        ">
          ${availableCurrencies
            .map(
              (code) => `
            <option value="${code}" ${code === state.currentCurrency ? "selected" : ""}>
              ${CURRENCY_SYMBOLS[code]} ${code}
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
