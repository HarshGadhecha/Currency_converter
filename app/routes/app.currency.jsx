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
