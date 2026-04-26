# Meta Pixel Verification Checklist

## Pre-Deployment Verification ✅

Before pushing to Vercel, verify locally:

### 1. Pixel Code in HTML
- [ ] Open `index.html`
- [ ] Search for "fbq('init'" 
- [ ] Verify Pixel ID: `757366257093417` is present
- [ ] Check that noscript tag exists

### 2. Tracking Functions Created
- [ ] File `src/utils/metaPixel.js` exists
- [ ] Can import: `import { trackPurchase } from '../utils/metaPixel'`
- [ ] All functions exported

### 3. Environment Variables
- [ ] `server/.env` has `META_PIXEL_ID=757366257093417`
- [ ] `.env.production` created with `VITE_META_PIXEL_ID=757366257093417`
- [ ] No syntax errors in .env files

---

## Post-Deployment Verification 🚀

After deploying to Vercel, test these:

### 1. Pixel is Loading
- [ ] Visit your Vercel URL
- [ ] Open DevTools (F12 → Console)
- [ ] Type: `window.fbq` 
- [ ] Should see: `ƒ (n,a,c,h)` (function)
- [ ] No "fbq is not defined" error

### 2. Page View Event Fires
- [ ] Open DevTools → **Network** tab
- [ ] Filter by: "facebook.com" or "facebook"
- [ ] Refresh page
- [ ] Should see request to `facebook.com/tr` with parameters
- [ ] Look for `ev=PageView` in URL

### 3. Test Custom Events
- [ ] Open DevTools → **Console** tab
- [ ] Type this and press Enter:
  ```javascript
  fbq('track', 'ViewContent', {value: 100, currency: 'INR', content_ids: ['test123']})
  ```
- [ ] Should see console log and network request
- [ ] No errors in console

### 4. Verify in Meta Events Manager
- [ ] Go to: **business.facebook.com/events_manager**
- [ ] Select your Pixel: **757366257093417**
- [ ] Click on **Test Events** tab
- [ ] Keep this page open in one window
- [ ] Visit your Vercel URL in another window
- [ ] Refresh your Vercel site a few times
- [ ] **Events should appear in Meta Events Manager within 5-10 seconds**
- [ ] Check if events like "PageView" or "ViewContent" appear

---

## Component Integration Verification ✅

For each page, verify before launching ads:

### ProductDetail.jsx
```javascript
// ✅ Should have this:
import { trackViewContent } from '../utils/metaPixel';

// ✅ Should track when product loads:
useEffect(() => {
  if (product) {
    trackViewContent({...})
  }
}, [product])

// Test: Visit a product page → See "ViewContent" event in Meta Events Manager
```

### Cart.jsx  
```javascript
// ✅ Should have:
import { trackAddToCart, trackRemoveFromCart } from '../utils/metaPixel';

// ✅ Track add to cart:
trackAddToCart({...})

// Test: Add product to cart → See "AddToCart" event
```

### Checkout.jsx
```javascript
// ✅ Should have:
import { trackInitiateCheckout } from '../utils/metaPixel';

// ✅ Track when checkout starts:
trackInitiateCheckout({...})

// Test: Click "Checkout" → See "InitiateCheckout" event
```

### OrderConfirmation.jsx ⭐ CRITICAL
```javascript
// ✅ MUST HAVE:
import { trackPurchase } from '../utils/metaPixel';

// ✅ MUST CALL after order is confirmed:
useEffect(() => {
  if (order) {
    trackPurchase({
      value: order.total,
      currency: 'INR',
      content_ids: [...],
      ...
    })
  }
}, [order])

// Test: Complete a purchase → MUST see "Purchase" event in Meta Events Manager
```

---

## Testing a Full Purchase Flow ✅

### Step-by-Step Test:

1. **Test Account Setup**
   - Login/Register on your site
   - `Login` event fires ✅

2. **Browse Products**
   - Click on product
   - `ViewContent` event fires ✅

3. **Add to Cart**
   - Click "Add to Cart"
   - `AddToCart` event fires ✅

4. **Go to Checkout**
   - Click "Checkout" or "Proceed to Checkout"
   - `InitiateCheckout` event fires ✅

5. **Complete Payment**
   - Fill checkout form
   - `AddPaymentInfo` event fires ✅

6. **Order Confirmation** ⭐
   - See order confirmation page
   - `Purchase` event fires ✅
   - **THIS IS THE MOST IMPORTANT EVENT FOR ADS**

### Verification Timeline:
- Events should fire within 1-2 seconds of action
- Should appear in Events Manager within 5-10 seconds
- Check Console tab for any errors (should be none)

---

## Common Issues Checklist 🐛

If events aren't appearing:

### Pixel Code Issues
- [ ] Pixel code in `<head>` of index.html (not `<body>`)
- [ ] Pixel ID is exactly: `757366257093417`
- [ ] No JavaScript syntax errors in index.html
- [ ] Meta tracking library loads successfully (no 404 errors)

### Event Tracking Issues
- [ ] Import statement correct: `import { trackPurchase } from '../utils/metaPixel'`
- [ ] Function names exact: `trackPurchase()`, `trackAddToCart()`, etc.
- [ ] Event data passed correctly (required fields: value, currency)
- [ ] Events called at correct time (after action, not before)

### Deployment Issues
- [ ] Website is publicly accessible (not localhost)
- [ ] Vercel deployment successful (check build logs)
- [ ] No CORS errors in browser console
- [ ] Facebook domain not blocked by ad blocker
- [ ] Browser console shows no errors

---

## Domain Verification (Required for Ads) 📋

### Before Running Ads Campaign:

1. **Verify Domain in Meta**
   - Go to: business.facebook.com/settings
   - Go to: **Domains** section
   - Add domain: `your-site.vercel.app`
   - Download verification code
   - Upload to `public/meta-verification-code.html` OR
   - Add to DNS records (recommended)
   - Click "Verify" in Meta

2. **Alternative: Add Verified Meta App**
   - Go to: developer.facebook.com
   - Create app if needed
   - Add app to your domain verification

---

## 🎯 Pre-Ad-Launch Checklist

- [ ] ✅ Pixel code in index.html
- [ ] ✅ metaPixel.js functions working
- [ ] ✅ Event tracking integrated into pages
- [ ] ✅ Deploy to Vercel successful
- [ ] ✅ fbq is accessible in console
- [ ] ✅ PageView events firing
- [ ] ✅ Product view events firing
- [ ] ✅ Add to cart events firing
- [ ] ✅ Checkout events firing
- [ ] ✅ Purchase events firing (CRITICAL!)
- [ ] ✅ Events visible in Meta Events Manager
- [ ] ✅ Domain verified in Meta Business
- [ ] ✅ Conversion events created in Events Manager
- [ ] ✅ Ads Manager campaign created
- [ ] ✅ Budget set and targeting configured

---

## 📞 Troubleshooting

### Pixel Events Not Appearing?
1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh (Ctrl+F5)
3. Try incognito window
4. Check if ad blocker is blocking Facebook
5. Check DevTools Network tab for fbq requests

### Need Help?
- Meta Help: business.facebook.com/help
- Events Manager Guide: developers.facebook.com/docs/facebook-pixel
- Your Pixel ID: `757366257093417`

---

## ✅ When You're Ready to Launch

Once all checklist items are ✅, you can:

1. Go to **ads.facebook.com**
2. Create a new campaign
3. Select **Conversions** objective
4. Choose your Pixel: `757366257093417`
5. Set your budget
6. Launch your ads! 🚀

**Status:** {{ current_date }}
**Pixel ID:** 757366257093417  
**Ready:** YES ✅
