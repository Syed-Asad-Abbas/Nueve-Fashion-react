# Nueve React storefront

A standalone React copy of the Nueve Figma storefront. It uses local image/font assets and a hardcoded catalog; it does not call Shopify or depend on the original preview server.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. `npm run build` creates the production files in `dist`; `npm run preview` serves that build. Production hosting needs a fallback to `index.html` for the product, cart, and collection routes.

## Edit

- `src/catalog.js`: product names, prices, images, categories, sizes, and colors.
- `src/main.jsx`: pages, content, and interactions.
- `src/styles.css`: React-specific styling. Shared Figma styles are in `public/assets`.
- `src/mobile.css`: phone layouts and tablet navigation, based on the screenshots in `figma/responsive`. The phone status bar belongs to the device and is excluded from the webpage.

## Features

Homepage audience and collection filters; catalog filtering, price ranges and sorting; product search; product image gallery, size/color selection and quantities; persistent cart with quantity updates and removal; automatic Buy 3, Get 1 Free promotion (the cheapest item is free for every four items), `NUEVE10` discount code; demo checkout, confirmations, profile and order history; saved newsletter/contact forms; FAQ, shipping information, social links and mobile navigation.

Product prices and names in the provided design are used for the six trending products and three mesh shirts. Additional accessory prices are editable demo data.

Cart, profile, orders, newsletter preferences, and contact messages use browser localStorage. The account is a local profile, not authenticated access. Checkout records a demo order; it does not collect a payment, send emails, reserve inventory, or arrange shipping. Newsletter/contact submissions are saved locally. Connecting those services requires a backend or external providers.

The existing Shopify theme is unchanged by this React project. No build files are required by the Shopify theme.
