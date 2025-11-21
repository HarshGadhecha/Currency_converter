import { json } from "react-router";
import { cors } from "@react-router/node";
import { getExchangeRates, SUPPORTED_CURRENCIES } from "../services/currency.service";

/**
 * Public API endpoint for getting exchange rates
 * This endpoint is called from the storefront
 */
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const baseCurrency = url.searchParams.get("base") || "USD";
  const targetCurrencies = url.searchParams.get("currencies")?.split(",") || [];

  try {
    const allRates = await getExchangeRates(baseCurrency);

    // Filter to only requested currencies if specified
    let rates = allRates;
    if (targetCurrencies.length > 0) {
      rates = {};
      targetCurrencies.forEach((currency) => {
        if (allRates[currency]) {
          rates[currency] = allRates[currency];
        }
      });
    }

    return json(
      {
        success: true,
        base: baseCurrency,
        rates,
        currencies: SUPPORTED_CURRENCIES,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
      }
    );
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return json(
      {
        success: false,
        error: "Failed to fetch exchange rates",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};

/**
 * Handle OPTIONS request for CORS
 */
export const action = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
