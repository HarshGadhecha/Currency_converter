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
          // Widget customization defaults
          borderRadius: "8px",
          borderWidth: "1px",
          borderColor: "#dddddd",
          shadowEnabled: true,
          shadowDepth: "medium",
          backgroundType: "solid",
          backgroundColor: "#ffffff",
          backgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          themePreset: "light",
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

    // Helper function to parse boolean values
    const parseBool = (value) => value === "true" || value === true;

    // Helper function to parse integer values
    const parseInt = (value, defaultValue) => {
      const parsed = Number(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    // Update or create settings
    const settings = await db.currencySettings.upsert({
      where: { shop },
      update: {
        enabled: parseBool(data.enabled),
        baseCurrency: data.baseCurrency || "USD",
        supportedCurrencies,
        autoDetect: parseBool(data.autoDetect),
        showCurrencyPicker: parseBool(data.showCurrencyPicker),
        roundPrices: parseBool(data.roundPrices),
        // Widget customization
        borderRadius: data.borderRadius || "8px",
        borderWidth: data.borderWidth || "1px",
        borderColor: data.borderColor || "#dddddd",
        shadowEnabled: parseBool(data.shadowEnabled),
        shadowDepth: data.shadowDepth || "medium",
        backgroundType: data.backgroundType || "solid",
        backgroundColor: data.backgroundColor || "#ffffff",
        backgroundGradient: data.backgroundGradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        themePreset: data.themePreset || "light",
        displayMode: data.displayMode || "symbol",
        themeMode: data.themeMode || "auto",
        customLightBg: data.customLightBg || "#ffffff",
        customLightText: data.customLightText || "#333333",
        customDarkBg: data.customDarkBg || "#1a1a1a",
        customDarkText: data.customDarkText || "#ffffff",
        desktopPosition: data.desktopPosition || "top-right",
        desktopCustomX: data.desktopCustomX || "20px",
        desktopCustomY: data.desktopCustomY || "20px",
        mobilePosition: data.mobilePosition || "bottom-fixed",
        mobileCustomX: data.mobileCustomX || "50%",
        mobileCustomY: data.mobileCustomY || "auto",
        mobileCompact: parseBool(data.mobileCompact),
        fontSize: data.fontSize || "14px",
        padding: data.padding || "12px",
        zIndex: parseInt(data.zIndex, 9999),
        updatedAt: new Date(),
      },
      create: {
        shop,
        enabled: parseBool(data.enabled),
        baseCurrency: data.baseCurrency || "USD",
        supportedCurrencies,
        autoDetect: parseBool(data.autoDetect),
        showCurrencyPicker: parseBool(data.showCurrencyPicker),
        roundPrices: parseBool(data.roundPrices),
        // Widget customization
        borderRadius: data.borderRadius || "8px",
        borderWidth: data.borderWidth || "1px",
        borderColor: data.borderColor || "#dddddd",
        shadowEnabled: parseBool(data.shadowEnabled),
        shadowDepth: data.shadowDepth || "medium",
        backgroundType: data.backgroundType || "solid",
        backgroundColor: data.backgroundColor || "#ffffff",
        backgroundGradient: data.backgroundGradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        themePreset: data.themePreset || "light",
        displayMode: data.displayMode || "symbol",
        themeMode: data.themeMode || "auto",
        customLightBg: data.customLightBg || "#ffffff",
        customLightText: data.customLightText || "#333333",
        customDarkBg: data.customDarkBg || "#1a1a1a",
        customDarkText: data.customDarkText || "#ffffff",
        desktopPosition: data.desktopPosition || "top-right",
        desktopCustomX: data.desktopCustomX || "20px",
        desktopCustomY: data.desktopCustomY || "20px",
        mobilePosition: data.mobilePosition || "bottom-fixed",
        mobileCustomX: data.mobileCustomX || "50%",
        mobileCustomY: data.mobileCustomY || "auto",
        mobileCompact: parseBool(data.mobileCompact),
        fontSize: data.fontSize || "14px",
        padding: data.padding || "12px",
        zIndex: parseInt(data.zIndex, 9999),
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
