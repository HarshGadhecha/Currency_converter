# 💱 Currency Converter App for Shopify

A powerful Shopify app that automatically converts product prices to your customer's local currency based on their location, with real-time exchange rates.

## 🎯 Features

- ✅ **Automatic Currency Detection** - Detects customer location and shows prices in their local currency
- 💱 **Real-Time Exchange Rates** - Uses free exchangerate-api.com for up-to-date conversion rates
- 🌍 **20+ Supported Currencies** - USD, EUR, GBP, CAD, AUD, JPY, INR, and many more
- 🎨 **Currency Picker Dropdown** - Allows customers to manually select their preferred currency
- ⚡ **Fast & Cached** - Exchange rates are cached for 1 hour for optimal performance
- 🎨 **Customizable** - Configure which currencies to support and display options
- 🔄 **Dynamic Price Conversion** - Automatically converts dynamically loaded prices

## 📦 Installation

### Prerequisites

- Node.js (version 20.19 or higher)
- Shopify Partner Account
- Shopify Development Store or Test Store
- Shopify CLI installed

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Database

The app uses Prisma with SQLite for local development. Run the database setup:

```bash
npm run setup
```

This will:
- Generate Prisma Client
- Run database migrations
- Create the necessary tables

### Step 3: Start Development Server

```bash
npm run dev
```

This will:
- Start the development server
- Open a tunnel to your local server
- Provide a URL to install the app in your dev store

### Step 4: Install the App

1. When prompted, press `P` to open the installation URL
2. Click "Install" to add the app to your development store
3. The app will be installed in your Shopify admin

## 🎛️ Configuration

### Admin Settings

Once installed, navigate to **Apps → Currency Converter** in your Shopify admin:

1. **Enable Currency Converter** - Toggle to enable/disable the feature
2. **Base Currency** - Select your store's base currency (the currency your products are priced in)
3. **Supported Currencies** - Choose which currencies to support
4. **Display Options**:
   - Auto-detect customer location
   - Show currency picker dropdown
   - Round converted prices

### Theme Integration

The app uses a **Theme App Extension** that automatically integrates with your theme:

1. Go to **Online Store → Themes → Customize**
2. In the theme editor, you'll see **App embeds** in the left sidebar
3. Find **Currency Converter** and enable it
4. You can customize the picker position (top-right, top-left, bottom-right, bottom-left)

## 🔧 How It Works

### Backend (App Server)

1. **Currency Service** (`app/services/currency.service.js`)
   - Fetches real-time exchange rates from exchangerate-api.com
   - Caches rates for 1 hour to reduce API calls
   - Provides currency conversion functions

2. **Admin Settings** (`app/routes/app.currency.jsx`)
   - Allows merchants to configure currency settings
   - Settings are stored in SQLite database

3. **Public API** (`app/routes/api.exchange-rates.jsx`)
   - Provides exchange rates to the storefront
   - Accessible without authentication
   - CORS-enabled for cross-origin requests

### Frontend (Storefront)

1. **Currency Converter Script** (`extensions/currency-converter/assets/currency-converter.js`)
   - Detects customer location using ipapi.co geolocation API
   - Fetches exchange rates from your app's API
   - Finds all price elements on the page
   - Converts prices to selected currency
   - Creates currency picker dropdown
   - Watches for dynamically loaded content

2. **Theme Integration** (`extensions/currency-converter/blocks/`)
   - Liquid template for theme integration
   - Configurable settings in theme editor
   - Automatic script loading

## 🌍 Supported Currencies

The app supports 20+ major world currencies:

| Currency | Code | Symbol |
|----------|------|--------|
| US Dollar | USD | $ |
| Euro | EUR | € |
| British Pound | GBP | £ |
| Canadian Dollar | CAD | C$ |
| Australian Dollar | AUD | A$ |
| Japanese Yen | JPY | ¥ |
| Indian Rupee | INR | ₹ |
| Chinese Yuan | CNY | ¥ |
| Swiss Franc | CHF | CHF |
| Swedish Krona | SEK | kr |
| ...and more | | |

## 📝 API Documentation

### Exchange Rates API

**Endpoint:** `/api/exchange-rates`

**Method:** GET

**Parameters:**
- `base` (optional) - Base currency code (default: USD)
- `currencies` (optional) - Comma-separated list of target currencies

**Example:**
```
GET /api/exchange-rates?base=USD&currencies=EUR,GBP,CAD
```

**Response:**
```json
{
  "success": true,
  "base": "USD",
  "rates": {
    "EUR": 0.92,
    "GBP": 0.79,
    "CAD": 1.35
  },
  "currencies": {
    "EUR": { "symbol": "€", "name": "Euro" },
    "GBP": { "symbol": "£", "name": "British Pound" },
    "CAD": { "symbol": "C$", "name": "Canadian Dollar" }
  },
  "timestamp": 1700000000000
}
```

### Currency Settings API

**Endpoint:** `/app/currency-settings`

**Method:** GET (Load settings) / POST (Save settings)

**Authentication:** Requires Shopify admin authentication

## 🎨 Customization

### Changing Currency Picker Style

Edit the inline styles in `extensions/currency-converter/assets/currency-converter.js`:

```javascript
const pickerHTML = `
  <div id="currency-converter-picker" style="
    /* Add your custom styles here */
    background: white;
    border: 1px solid #ddd;
    ...
  ">
  ...
  </div>
`;
```

### Adding More Currencies

Edit `app/services/currency.service.js` and add to the `SUPPORTED_CURRENCIES` object:

```javascript
export const SUPPORTED_CURRENCIES = {
  // ... existing currencies
  DKK: { symbol: "kr", name: "Danish Krone" },
  // Add more here
};
```

## 🚀 Deployment

When ready to deploy to production:

1. **Set up production database** (PostgreSQL, MySQL, etc.)
2. **Update Prisma schema** in `prisma/schema.prisma`
3. **Build the app:**
   ```bash
   npm run build
   ```
4. **Deploy the app** using the Shopify CLI:
   ```bash
   npm run deploy
   ```

See [Shopify's deployment documentation](https://shopify.dev/docs/apps/launch/deployment) for detailed instructions.

## 🔒 Security & Privacy

- Exchange rates are fetched from a reputable free API (exchangerate-api.com)
- Customer location is detected using ipapi.co (no personal data stored)
- Selected currency preference is stored in browser localStorage only
- No sensitive customer data is collected or transmitted

## 🐛 Troubleshooting

### Prices Not Converting

1. Check that the app is enabled in admin settings
2. Verify the theme app extension is enabled in the theme editor
3. Check browser console for JavaScript errors
4. Ensure price elements have standard Shopify classes (`.price`, `.money`, etc.)

### Exchange Rates Not Loading

1. Check network tab for failed API requests
2. Verify the API endpoint is accessible
3. Check if exchange rate API is rate-limited (very unlikely with free tier)

### Currency Picker Not Showing

1. Check that "Show Currency Picker" is enabled in settings
2. Verify the theme app extension is properly installed
3. Check for CSS conflicts with your theme

## 📚 Resources

- [Shopify App Development](https://shopify.dev/docs/apps)
- [React Router Docs](https://reactrouter.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shopify Theme App Extensions](https://shopify.dev/docs/apps/online-store/theme-app-extensions)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Shopify's app development documentation
3. Check the code comments for implementation details

## 📄 License

This is a Shopify app template for educational and commercial use.

---

**Built with ❤️ using Shopify App Template and React Router**
