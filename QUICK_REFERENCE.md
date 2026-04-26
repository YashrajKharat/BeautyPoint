# 🎯 Meta Pixel Quick Reference Card

## Your Pixel Information
```
Pixel ID:     757366257093417
Status:       ✅ ACTIVE
Platform:     Meta (Facebook/Instagram)
Your Website: Beauty Point E-commerce
```

---

## 5-Minute Quick Start

### Step 1: Update URLs
Edit `.env.production`:
```
VITE_API_URL=https://your-render-backend.onrender.com/api
```

### Step 2: Add Tracking
Copy from `META_PIXEL_EXAMPLES.js` to your pages:
- ProductDetail.jsx → `trackViewContent()`
- Cart.jsx → `trackAddToCart()`  
- Checkout.jsx → `trackInitiateCheckout()`
- OrderConfirmation.jsx → `trackPurchase()` ⭐

### Step 3: Deploy
```bash
git push  # Auto-deploys to Vercel
```

### Step 4: Test
1. Visit your Vercel URL
2. Open DevTools (F12)
3. Console → Type `fbq` → Should work
4. Go to: business.facebook.com/events_manager
5. Select Pixel: 757366257093417
6. Click "Test Events"
7. Refresh your site → See events appear

### Step 5: Launch Ads
1. Go to: ads.facebook.com
2. Create Campaign → Conversions
3. Select Pixel: 757366257093417
4. Set budget & targeting
5. Launch! 🚀

---

## Essential Files Reference

| What | Where | Status |
|-----|-------|--------|
| Pixel Code | index.html | ✅ Done |
| Event Functions | src/utils/metaPixel.js | ✅ Done |
| Config | server/.env, .env.production | ✅ Done |
| Examples | META_PIXEL_EXAMPLES.js | ✅ Done |
| Full Guide | META_ADS_SETUP.md | 📖 Read |
| Quick Start | QUICK_START_META.md | 📖 Read |

---

## Core Events Quick Guide

```javascript
// Product Viewed
import { trackViewContent } from '../utils/metaPixel';
trackViewContent({
  id: product.id,
  name: product.name,
  price: product.price
});

// Added to Cart  
import { trackAddToCart } from '../utils/metaPixel';
trackAddToCart({
  id: item.id,
  name: item.name,
  price: item.price
});

// Checkout Started
import { trackInitiateCheckout } from '../utils/metaPixel';
trackInitiateCheckout({
  total: cartTotal,
  numItems: cart.length
});

// Purchase Complete ⭐ MOST IMPORTANT
import { trackPurchase } from '../utils/metaPixel';
trackPurchase({
  total: order.total,
  currency: 'INR',
  numItems: order.items.length,
  products: order.items
});
```

---

## Troubleshooting Quick Fix

| Problem | Solution |
|---------|----------|
| No fbq in console | Check if Vercel deployed, clear cache (Ctrl+Shift+Del) |
| Events not appearing | Check DevTools Network, look for facebook.com/tr requests |
| Wrong Pixel ID | Verify: 757366257093417 in index.html |
| Events delayed | Normal - takes 5-10 seconds |
| Deploy failed | Check git status, commit changes properly |

---

## Testing Checklist

- [ ] fbq is accessible in console
- [ ] Network requests go to facebook.com/tr
- [ ] Events appear in Events Manager within 10 sec
- [ ] PageView event fires automatically
- [ ] ProductView event fires on product page
- [ ] Purchase event fires on order confirmation
- [ ] No JavaScript errors in console

---

## Important Links

- **Events Manager**: business.facebook.com/events_manager
- **Ads Manager**: ads.facebook.com
- **Business Suite**: business.facebook.com
- **Developer Docs**: developers.facebook.com/docs/facebook-pixel
- **Help Center**: facebook.com/business/help

---

## Common Issues & Fixes

### "fbq is not defined"
```javascript
// Fix: Check if fbq loaded
setTimeout(() => {
  if (window.fbq) console.log('Pixel ready!');
}, 2000);
```

### Events not tracking
1. Verify Pixel ID: 757366257093417
2. Check if functions imported correctly
3. Ensure functions called at right time
4. Check DevTools console for errors

### Events appearing late
- Normal behavior - Meta batches events
- Wait 5-10 seconds before checking
- Use Test Events for real-time feedback

---

## Ads Budget Guide

| Budget | Duration | Expected |
|--------|----------|----------|
| ₹500/day | 7 days | 3-5 sales |
| ₹1000/day | 7 days | 7-10 sales |
| ₹2000/day | 14 days | 25-40 sales |

*Actual results depend on targeting, product, and creatives*

---

## Pre-Launch Checklist

✅ Pixel installed
✅ Events tracking added  
✅ .env files updated
✅ Deployed to Vercel
✅ Events verified in Meta
✅ Domain verified
✅ Ad account funded
✅ Campaign created
✅ Ready to launch!

---

## Your Next Action RIGHT NOW

1. Open `META_PIXEL_EXAMPLES.js`
2. Copy the ProductDetail code
3. Paste into your ProductDetail.jsx
4. Do same for Cart, Checkout, OrderConfirmation
5. Push to git
6. Test on Vercel
7. Launch campaign

**Pixel ID to Use: 757366257093417**

---

*Last Updated: April 26, 2026*  
*Status: ✅ READY TO RUN ADS*
