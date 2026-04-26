/**
 * Meta Pixel Event Tracking Utility
 * Tracks user interactions and conversions for Meta Ads
 */

// Meta Pixel ID
const META_PIXEL_ID = '757366257093417';

/**
 * Initialize Meta Pixel (already done in index.html, but available for reference)
 */
export const initMetaPixel = () => {
  if (window.fbq) {
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }
};

/**
 * Track Page View
 */
export const trackPageView = () => {
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

/**
 * Track View Content (Product Page View)
 * @param {Object} productData - Product information
 */
export const trackViewContent = (productData) => {
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [productData.id],
      content_name: productData.name,
      content_type: 'product',
      value: productData.price,
      currency: 'INR', // Change to your currency
      ...productData
    });
  }
  console.log('📸 Meta Event: ViewContent', productData);
};

/**
 * Track Add to Cart
 * @param {Object} cartData - Cart item information
 */
export const trackAddToCart = (cartData) => {
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [cartData.id],
      content_name: cartData.name,
      content_type: 'product',
      value: cartData.price,
      currency: 'INR',
      content_category: cartData.category || 'product',
      quantity: cartData.quantity || 1,
      ...cartData
    });
  }
  console.log('🛒 Meta Event: AddToCart', cartData);
};

/**
 * Track Remove From Cart
 * @param {Object} cartData - Cart item information
 */
export const trackRemoveFromCart = (cartData) => {
  if (window.fbq) {
    window.fbq('track', 'RemoveFromCart', {
      content_ids: [cartData.id],
      content_name: cartData.name,
      content_type: 'product',
      value: cartData.price,
      currency: 'INR',
      ...cartData
    });
  }
  console.log('❌ Meta Event: RemoveFromCart', cartData);
};

/**
 * Track Initiate Checkout
 * @param {Object} checkoutData - Checkout information
 */
export const trackInitiateCheckout = (checkoutData) => {
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_type: 'product',
      value: checkoutData.total,
      currency: 'INR',
      num_items: checkoutData.numItems,
      contents: checkoutData.items || [],
      ...checkoutData
    });
  }
  console.log('💳 Meta Event: InitiateCheckout', checkoutData);
};

/**
 * Track Add Payment Info
 * @param {Object} paymentData - Payment information
 */
export const trackAddPaymentInfo = (paymentData) => {
  if (window.fbq) {
    window.fbq('track', 'AddPaymentInfo', {
      content_type: 'product',
      value: paymentData.total,
      currency: 'INR',
      ...paymentData
    });
  }
  console.log('💰 Meta Event: AddPaymentInfo', paymentData);
};

/**
 * Track Purchase (Most Important Conversion)
 * @param {Object} orderData - Order information
 */
export const trackPurchase = (orderData) => {
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: orderData.total,
      currency: 'INR',
      content_type: 'product',
      content_ids: orderData.products?.map(p => p.id) || [],
      content_name: orderData.products?.map(p => p.name).join(', ') || 'Order',
      contents: orderData.products || [],
      num_items: orderData.numItems,
      ...orderData
    });
  }
  console.log('✅ Meta Event: Purchase', orderData);
};

/**
 * Track Lead (Sign-up, Newsletter, etc.)
 * @param {Object} leadData - Lead information
 */
export const trackLead = (leadData) => {
  if (window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: leadData.type || 'Lead',
      content_category: leadData.category || 'signup',
      ...leadData
    });
  }
  console.log('👤 Meta Event: Lead', leadData);
};

/**
 * Track Complete Registration
 * @param {Object} userData - User registration data
 */
export const trackCompleteRegistration = (userData) => {
  if (window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      status: true,
      ...userData
    });
  }
  console.log('📝 Meta Event: CompleteRegistration', userData);
};

/**
 * Track Search
 * @param {string} searchQuery - Search query
 */
export const trackSearch = (searchQuery) => {
  if (window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchQuery
    });
  }
  console.log('🔍 Meta Event: Search', searchQuery);
};

/**
 * Track Login
 */
export const trackLogin = () => {
  if (window.fbq) {
    window.fbq('track', 'Login');
  }
  console.log('🔐 Meta Event: Login');
};

/**
 * Track Custom Event
 * @param {string} eventName - Event name
 * @param {Object} eventData - Event data
 */
export const trackCustomEvent = (eventName, eventData) => {
  if (window.fbq) {
    window.fbq('track', eventName, eventData);
  }
  console.log(`📊 Meta Event: ${eventName}`, eventData);
};

export default {
  initMetaPixel,
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackRemoveFromCart,
  trackInitiateCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  trackLead,
  trackCompleteRegistration,
  trackSearch,
  trackLogin,
  trackCustomEvent
};
