# Meta Pixel & Facebook Ads Setup Guide

## ✅ What's Been Set Up

### 1. **Meta Pixel Installation** (index.html)
- Meta Pixel code (ID: 757366257093417) has been added to your HTML head
- Page view tracking is active globally
- NoScript fallback for non-JavaScript users is enabled

### 2. **Event Tracking System** (src/utils/metaPixel.js)
Available events to track:
- ✅ `trackPageView()` - Track page visits
- ✅ `trackViewContent()` - Product page views
- ✅ `trackAddToCart()` - Add to cart actions
- ✅ `trackRemoveFromCart()` - Remove from cart
- ✅ `trackInitiateCheckout()` - Checkout started
- ✅ `trackAddPaymentInfo()` - Payment method added
- ✅ `trackPurchase()` - **Most important - order completion**
- ✅ `trackLead()` - Newsletter signups
- ✅ `trackCompleteRegistration()` - User registration
- ✅ `trackSearch()` - Product searches
- ✅ `trackLogin()` - User login
- ✅ `trackCustomEvent()` - Custom events

### 3. **Environment Variables**
- Meta Pixel ID stored in `.env.production`
- Ready for deployment to Vercel and Render

---

## 🚀 Next Steps to Run Your Meta Ads Campaign

### Step 1: Verify Pixel Installation
1. Visit your Vercel URL (deployed website)
2. Open browser DevTools (F12)
3. Go to Console tab
4. Type: `window.fbq` - should return the function
5. Type: `fbq` - should exist without errors

### Step 2: Update Hosted URLs in .env
```bash
# In server/.env - Update these:
VERCEL_URL=https://your-site.vercel.app
RENDER_URL=https://your-render-backend.onrender.com

# In .env.production - Update:
VITE_API_URL=https://your-render-backend.onrender.com/api
```

### Step 3: Add Event Tracking to Your Pages

#### ProductDetail.jsx - Track product views:
```javascript
import { trackViewContent } from '../utils/metaPixel';

useEffect(() => {
  if (product) {
    trackViewContent({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category
    });
  }
}, [product]);
```

#### Cart.jsx - Track add/remove cart:
```javascript
import { trackAddToCart, trackRemoveFromCart } from '../utils/metaPixel';

const handleAddToCart = (item) => {
  trackAddToCart({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: 1
  });
};
```

#### Checkout.jsx - Track checkout & purchase:
```javascript
import { trackInitiateCheckout, trackPurchase } from '../utils/metaPixel';

// When checkout starts:
const handleCheckoutStart = () => {
  trackInitiateCheckout({
    total: cartTotal,
    numItems: cart.length,
    items: cart
  });
};

// After successful order (OrderConfirmation.jsx):
useEffect(() => {
  if (order) {
    trackPurchase({
      total: order.total,
      numItems: order.items.length,
      products: order.items
    });
  }
}, [order]);
```

### Step 4: Verify Pixel Events in Meta Events Manager
1. Go to **facebook.com/business**
2. Click **Events Manager** (or directly: business.facebook.com/events_manager)
3. Select your data source (your Pixel ID: 757366257093417)
4. Go to **Test Events** tab
5. Visit your Vercel website - you should see events appearing in real-time
6. Ensure purchase events are coming through

### Step 5: Create Your Meta/Facebook Ad Campaign

#### In Meta Ads Manager:
1. Go to **ads.facebook.com**
2. Click **Create** → **Campaign**
3. Choose campaign objective:
   - **Conversions** (for sales tracking)
   - **Traffic** (for clicks to site)
   - **Catalog Sales** (if you have product catalog)
   
4. Select your Pixel (757366257093417) as conversion tracking
5. Configure targeting:
   - Age, location, interests
   - Custom audiences based on website activity
   - Lookalike audiences (people similar to your customers)

6. Create ads with:
   - Product images/carousel
   - Compelling copy
   - Strong call-to-action
   - Link to your Vercel site

### Step 6: Domain Verification (Important!)
1. Meta Ads Manager → **Settings** → **Domains**
2. Add your Vercel domain:
   - `your-site.vercel.app`
3. Complete domain verification:
   - Download meta verification file
   - Upload to your public folder
   - Verify in Meta Business Suite

### Step 7: Set Up Conversion Events
1. Events Manager → Your Pixel
2. Go to **Conversions**
3. Create conversion events for:
   - **Purchase** (highest value)
   - **InitiateCheckout**
   - **ViewContent**
   - **AddToCart**
   - **Lead** (newsletter signup)

### Step 8: Monitor Campaign Performance
1. Go to **Ads Manager** → Your Active Campaigns
2. Monitor metrics:
   - **Impressions** (how many saw the ad)
   - **Clicks** (traffic to your site)
   - **Conversions** (purchases)
   - **ROAS** (Return on Ad Spend)
   - **Cost per Purchase**

---

## 💡 Important Notes

### Pixel Fire Indicators
- Green checkmark ✅ = Pixel is working correctly
- Any warnings ⚠️ = Check DevTools console for errors

### Best Practices
1. **Start small** - Begin with $5-10/day budget
2. **Use Pixel data** - Wait 48-72 hours for Meta to optimize
3. **Retargeting** - Set up ads for people who visited but didn't buy
4. **A/B Testing** - Test different ad creatives and copy
5. **Daily monitoring** - Check performance daily for first week

### Common Issues & Fixes
| Issue | Solution |
|-------|----------|
| Pixel not firing | Check browser console for JS errors |
| No events in Events Manager | Verify Pixel ID is correct |
| Low conversion tracking | Ensure trackPurchase() is called on OrderConfirmation |
| Ad account limited | Complete Meta's data policy agreement |

---

## 📱 Deployment Checklist

- [ ] Pixel code added to index.html ✅ Done
- [ ] Event tracking file created ✅ Done  
- [ ] Environment variables configured ✅ Done
- [ ] Update .env with actual Vercel/Render URLs
- [ ] Add event tracking to React components
- [ ] Deploy to Vercel/Render
- [ ] Verify pixel fires on live site
- [ ] Verify events in Meta Events Manager
- [ ] Complete domain verification in Meta
- [ ] Create conversion events in Events Manager
- [ ] Launch ad campaign in Ads Manager

---

## 📞 Your Meta Pixel ID
```
Pixel ID: 757366257093417
```

## 🔗 Useful Links
- Meta Business Suite: https://business.facebook.com/
- Events Manager: https://business.facebook.com/events_manager
- Ads Manager: https://ads.facebook.com/
- Meta for Business Help: https://www.facebook.com/business/help

---

**Last Updated:** April 2026
**Status:** Ready to launch ads campaign
