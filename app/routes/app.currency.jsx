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

  // Form state
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

  const isLoading = fetcher.state === "submitting";

  // Load settings on mount
  useEffect(() => {
    fetcher.load("/app/currency-settings");
  }, []);

  // Update form when settings are loaded
  useEffect(() => {
    if (fetcher.data?.settings) {
      const settings = fetcher.data.settings;
      setEnabled(settings.enabled);
      setBaseCurrency(settings.baseCurrency);
      setSelectedCurrencies(settings.supportedCurrencies);
      setAutoDetect(settings.autoDetect);
      setShowCurrencyPicker(settings.showCurrencyPicker);
      setRoundPrices(settings.roundPrices);
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
    formData.append("enabled", enabled);
    formData.append("baseCurrency", baseCurrency);
    formData.append("supportedCurrencies", selectedCurrencies.join(","));
    formData.append("autoDetect", autoDetect);
    formData.append("showCurrencyPicker", showCurrencyPicker);
    formData.append("roundPrices", roundPrices);

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
          <s-checkbox
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          >
            Enable Currency Converter
          </s-checkbox>

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

          <s-select
            value={baseCurrency}
            onChange={(e) => {
              const newBase = e.target.value;
              setBaseCurrency(newBase);
              // Ensure base currency is in selected currencies
              if (!selectedCurrencies.includes(newBase)) {
                setSelectedCurrencies([...selectedCurrencies, newBase]);
              }
            }}
          >
            {Object.entries(currencies).map(([code, info]) => (
              <option key={code} value={code}>
                {code} - {info.name} ({info.symbol})
              </option>
            ))}
          </s-select>
        </s-stack>
      </s-section>

      <s-section heading="Supported Currencies">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Select which currencies you want to support. Customers will only see
            these currencies in the currency picker.
          </s-paragraph>

          <s-stack direction="inline" gap="small" wrap>
            {Object.entries(currencies).map(([code, info]) => (
              <s-checkbox
                key={code}
                checked={selectedCurrencies.includes(code)}
                onChange={() => toggleCurrency(code)}
                disabled={code === baseCurrency}
              >
                {code} ({info.symbol})
              </s-checkbox>
            ))}
          </s-stack>

          <s-text tone="subdued">
            {selectedCurrencies.length} currencies selected
          </s-text>
        </s-stack>
      </s-section>

      <s-section heading="Display Options">
        <s-stack direction="block" gap="base">
          <s-checkbox
            checked={autoDetect}
            onChange={(e) => setAutoDetect(e.target.checked)}
          >
            Auto-detect customer location
          </s-checkbox>
          <s-text tone="subdued">
            Automatically detect the customer's country and show prices in their
            local currency
          </s-text>

          <s-checkbox
            checked={showCurrencyPicker}
            onChange={(e) => setShowCurrencyPicker(e.target.checked)}
          >
            Show currency picker dropdown
          </s-checkbox>
          <s-text tone="subdued">
            Allow customers to manually select their preferred currency
          </s-text>

          <s-checkbox
            checked={roundPrices}
            onChange={(e) => setRoundPrices(e.target.checked)}
          >
            Round converted prices
          </s-checkbox>
          <s-text tone="subdued">
            Round prices to the nearest whole number (e.g., $19.99 becomes $20.00)
          </s-text>
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
