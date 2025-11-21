import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * Loader: Get currency settings for the shop
 */
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    let settings = await db.currencySettings.findUnique({
      where: { shop },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await db.currencySettings.create({
        data: {
          shop,
          enabled: true,
          baseCurrency: "USD",
          supportedCurrencies: "USD,EUR,GBP,CAD,AUD,JPY,INR",
          autoDetect: true,
          showCurrencyPicker: true,
          roundPrices: false,
        },
      });
    }

    return Response.json({
      success: true,
      settings: {
        ...settings,
        supportedCurrencies: settings.supportedCurrencies.split(","),
      },
    });
  } catch (error) {
    console.error("Error loading currency settings:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to load settings",
      },
      { status: 500 }
    );
  }
};

/**
 * Action: Save currency settings
 */
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Parse supported currencies array if it's a string
    let supportedCurrencies = data.supportedCurrencies;
    if (Array.isArray(supportedCurrencies)) {
      supportedCurrencies = supportedCurrencies.join(",");
    }

    // Update or create settings
    const settings = await db.currencySettings.upsert({
      where: { shop },
      update: {
        enabled: data.enabled === "true" || data.enabled === true,
        baseCurrency: data.baseCurrency || "USD",
        supportedCurrencies,
        autoDetect: data.autoDetect === "true" || data.autoDetect === true,
        showCurrencyPicker:
          data.showCurrencyPicker === "true" ||
          data.showCurrencyPicker === true,
        roundPrices: data.roundPrices === "true" || data.roundPrices === true,
        updatedAt: new Date(),
      },
      create: {
        shop,
        enabled: data.enabled === "true" || data.enabled === true,
        baseCurrency: data.baseCurrency || "USD",
        supportedCurrencies,
        autoDetect: data.autoDetect === "true" || data.autoDetect === true,
        showCurrencyPicker:
          data.showCurrencyPicker === "true" ||
          data.showCurrencyPicker === true,
        roundPrices: data.roundPrices === "true" || data.roundPrices === true,
      },
    });

    return Response.json({
      success: true,
      settings: {
        ...settings,
        supportedCurrencies: settings.supportedCurrencies.split(","),
      },
    });
  } catch (error) {
    console.error("Error saving currency settings:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to save settings",
      },
      { status: 500 }
    );
  }
};
