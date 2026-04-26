# Meta Ads Campaign - Quick Start Guide

## ✅ Your Setup is Ready!

Your Meta Pixel (ID: **757366257093417**) has been installed and is ready to run ads!

---

## 🎯 Quick 5-Step Process

### Step 1: Update Your URLs (2 minutes)
Edit `server/.env` and `.env.production`:
```
VERCEL_URL=https://your-actual-vercel-url.vercel.app
RENDER_URL=https://your-actual-render-url.onrender.com
VITE_API_URL=https://your-actual-render-url.onrender.com/api
```

### Step 2: Add Event Tracking to Pages (15 minutes)
Copy code from `META_PIXEL_EXAMPLES.js` into your React pages:
- ✅ ProductDetail.jsx → Add `trackViewContent`
- ✅ Cart.jsx → Add `trackAddToCart`
- ✅ Checkout.jsx → Add `trackAddPaymentInfo`
- ✅ OrderConfirmation.jsx → Add `trackPurchase` ⭐ (Most Important!)

### Step 3: Deploy Updates (5 minutes)
```bash
git add .
git commit -m "Add Meta Pixel tracking"
git push  # Vercel auto-deploys
```

### Step 4: Verify Pixel is Working (5 minutes)
1. Visit your Vercel URL
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Type: `fbq` → Should show the function
5. View your site → You should see events in Meta Events Manager

### Step 5: Launch Your Ad Campaign (10 minutes)
1. Go to **ads.facebook.com**
2. Click **Create Campaign**
3. Select **Conversions** objective
4. Pick your Pixel: **757366257093417**
5. Set budget & targeting
6. Launch! 🚀

---

## 📊 Files Created/Modified

| File | Purpose |
|------|---------|
| `index.html` | ✅ Meta Pixel code added |
| `src/utils/metaPixel.js` | ✅ Event tracking functions |
| `server/.env` | ✅ Config variables added |
| `.env.production` | ✅ Frontend config created |
| `META_ADS_SETUP.md` | Complete setup guide |
| `META_PIXEL_EXAMPLES.js` | Code snippets to copy-paste |

---

## 🎬 Pixel Events Already Active

✅ **Page View** - Automatically tracked on every page
- Every visit is recorded

✅ **Ready to Track** (Just add to your pages):
- Product Views (ProductDetail page)
- Add to Cart (Cart page)
- Checkout Start (Checkout page)
- Purchase ⭐ (OrderConfirmation - MOST IMPORTANT!)
- Login
- Registration
- Search
- Newsletter Signup

---

## 📱 Your Meta Information

```
Pixel ID:     757366257093417
Pixel Status: ✅ ACTIVE & READY
Currency:     INR
Country:      India
```

---

## 💡 Testing Your Setup

### Before Launching Ads:

1. **Test Pixel Installation**
   ```javascript
   // In browser console:
   fbq('track', 'ViewContent', {value: 100, currency: 'INR'})
   ```

2. **Check Events Manager**
   - Go to: business.facebook.com/events_manager
   - Select your Pixel: 757366257093417
   - Click "Test Events"
   - Visit your site → See events appear in real-time

3. **Test Purchase Event** (Most Critical!)
   - Complete a test purchase on your site
   - Go to Events Manager
   - You should see "Purchase" event within 10 seconds

---

## ⚠️ Common Issues & Solutions

| Issue | Fix |
|-------|-----|
| Pixel not appearing in Events Manager | Wait 1-2 minutes, refresh browser |
| Events not firing | Check DevTools Console for errors |
| Low purchase tracking | Make sure OrderConfirmation.jsx calls `trackPurchase()` |
| Events delayed | Meta batches events, wait 5-10 seconds |
| Domain not verified | Add vercel domain to Meta Business Settings |

---

## 🎯 Next: Your Ad Strategy

### Targeting Options:
- 👥 **Interest Targeting**: Cosmetics, jewelry, fashion lovers
- 📍 **Location**: Major Indian cities (Delhi, Mumbai, Bangalore, etc.)
- 💰 **Budget**: Start with ₹500-1000/day
- ⏰ **Schedule**: 9 AM - 11 PM IST (peak shopping hours)

### Ad Creative Ideas:
- Product carousel with 3-5 best sellers
- Before/After beauty shots
- Customer testimonials
- Discount/sale promotions
- Limited time offers

### Retargeting Strategy:
- Target people who visited your site but didn't buy
- Show them different product images
- Offer a discount to encourage purchase

---

## 📞 Support

Need help? Check these:
1. **Setup Guide**: Read `META_ADS_SETUP.md`
2. **Code Examples**: See `META_PIXEL_EXAMPLES.js`
3. **Meta Help**: business.facebook.com/help

---

## 🚀 Summary

Your website is now **Meta Pixel ready**! 

**Next Actions:**
1. ✏️ Update .env with your actual Vercel/Render URLs
2. 📝 Add event tracking code to your pages
3. 🚀 Deploy to Vercel
4. ✅ Test pixel in browser
5. 📊 Verify events in Events Manager
6. 💳 Create ad campaign in Ads Manager
7. 🎯 Launch ads!

**Your Pixel ID:** `757366257093417`

Good luck with your ad campaign! 🎉
