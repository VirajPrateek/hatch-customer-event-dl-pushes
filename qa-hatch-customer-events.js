// Initialize GTM tag
(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  const f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l !== 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-PZ5FBSW');

console.log('🏷️ GTM-PZ5FBSW Loaded via Shopify Pixels');

// Helper function to process checkout data for ecommEvent
function processCheckoutData(checkout) {
  if (!checkout || !checkout.lineItems) {
    console.error('[lib/gtm/shopify-pixel-track.js] Invalid checkout data');
    return null;
  }
  return {
    coupon: _hatch_gtm_extractCouponFromDiscountApplications({
      discountApplications: checkout.discountApplications,
    }),
    discountTotal: _hatch_gtm_getTotalDiscount(checkout.discountApplications).toFixed(2),
    items: _hatch_gtm_getItemsFromLineItems(checkout.lineItems),
  };
}

// Subscribe to events
analytics.subscribe('page_viewed', (evt) => {
  console.info('[lib/gtm/shopify-pixel-track.js] page_viewed');
  const domDocument = evt.context.document;
  dataLayer.push({
    event: 'pageView',
    event_name: 'page_view',
    domDocument,
    page: {
      title: domDocument.title,
      type: 'checkout',
      environment: 'qa',
    },
  });
});

analytics.subscribe('checkout_contact_info_submitted', (event) => {
  const checkout = event.data.checkout;
  const processedData = processCheckoutData(checkout);
  if (!processedData) return;

  console.info('[lib/gtm/shopify-pixel-track.js] checkout_contact_info_submitted');
  dataLayer.push({
    event: 'ecommEvent',
    event_name: 'add_contact_info',
    ecommerce: {
      currencyCode: checkout.currencyCode,
      value: checkout.totalPrice.amount.toFixed(2),
      items: processedData.items,
      discount_total: processedData.discountTotal,
      coupon: processedData.coupon,
      order_id: checkout.order.id,
    },
  });
});

analytics.subscribe('checkout_address_info_submitted', (event) => {
  const checkout = event.data.checkout;
  const processedData = processCheckoutData(checkout);
  if (!processedData) return;

  console.info('[lib/gtm/shopify-pixel-track.js] checkout_address_info_submitted');
  dataLayer.push({
    event: 'ecommEvent',
    event_name: 'add_address_info',
    ecommerce: {
      currencyCode: checkout.currencyCode,
      value: checkout.totalPrice.amount.toFixed(2),
      items: processedData.items,
      discount_total: processedData.discountTotal,
      coupon: processedData.coupon,
      order_id: checkout.order.id,
    },
  });
});

analytics.subscribe('checkout_shipping_info_submitted', (event) => {
  const checkout = event.data.checkout;
  const processedData = processCheckoutData(checkout);
  if (!processedData) return;

  console.info('[lib/gtm/shopify-pixel-track.js] checkout_shipping_info_submitted');
  dataLayer.push({
    event: 'ecommEvent',
    event_name: 'add_shipping_info',
    ecommerce: {
      currencyCode: checkout.currencyCode,
      value: checkout.totalPrice.amount.toFixed(2),
      items: processedData.items,
      discount_total: processedData.discountTotal,
      coupon: processedData.coupon,
      order_id: checkout.order.id,
    },
  });
});

analytics.subscribe('payment_info_submitted', (event) => {
  const checkout = event.data.checkout;
  const processedData = processCheckoutData(checkout);
  if (!processedData) return;

  console.info('[lib/gtm/shopify-pixel-track.js] payment_info_submitted');
  dataLayer.push({
    event: 'ecommEvent',
    event_name: 'add_payment_info',
    ecommerce: {
      currencyCode: checkout.currencyCode,
      value: checkout.totalPrice.amount.toFixed(2),
      items: processedData.items,
      discount_total: processedData.discountTotal,
      coupon: processedData.coupon,
      order_id: checkout.order.id,
    },
  });
});

analytics.subscribe('checkout_completed', async (event) => {
  const checkout = event.data.checkout;
  const processedData = processCheckoutData(checkout);
  if (!processedData) return;

  console.info('[lib/gtm/shopify-pixel-track.js] checkout_completed');
  console.log('checkout_completed in GTM shopify pixels');
  console.log('email_hashed:' + await hashEmail(checkout.email));
  console.log('phone_hashed:' + await hashPhone(checkout.phone));

  dataLayer.push({
    event: 'ecommEvent',
    event_name: 'purchase',
    email: checkout.email,
    email_hashed: await hashEmail(checkout.email),
    phone_number_hashed: await hashPhone(checkout.phone),
    customer_id: checkout.order.customer.id,
    ecommerce: {
      currencyCode: checkout.currencyCode,
      value: checkout.totalPrice.amount.toFixed(2),
      order_id: checkout.order.id,
      items: processedData.items,
      quantity_total: checkout.lineItems.length,
      discount_total: processedData.discountTotal,
      coupon: processedData.coupon,
      first_name: checkout.shippingAddress.firstName,
      last_name: checkout.shippingAddress.lastName,
      phone: checkout.phone,
      city: checkout.shippingAddress.city,
      state: checkout.shippingAddress.province,
      country: checkout.shippingAddress.country,
      zip: checkout.shippingAddress.zip,
    },
  });
});

// Helper functions
function _hatch_gtm_extractCouponFromDiscountApplications({ discountApplications }) {
  return (discountApplications ?? []).map((d) => d.title).join(',');
}

function _hatch_gtm_getItemsFromLineItems(lineItems) {
  return lineItems.map(({ variant, quantity }) => {
    const { product } = variant;
    const hasVariantTitle = variant.title && variant.title !== 'Default Title';
    return {
      ['item_id']: variant.sku,
      ['item_name']: product.title,
      currency: variant.price.currencyCode,
      ['item_brand']: 'Hatch',
      ['item_category']: _hatch_gtm_getProductCategory(product.title),
      ['item_variant']: hasVariantTitle ? variant.title : '',
      price: variant.price.amount.toFixed(2),
      quantity,
    };
  });
}

function _hatch_gtm_getTotalDiscount(discountApplications) {
  return discountApplications.reduce(
    (acc, { value: { amount } }) => acc + amount,
    0
  );
}

function _hatch_gtm_getProductCategory(title) {
  if (!title) {
    return 'Unset';
  }
  const matcherTitle = title.toLowerCase();
  if (['restore', 'pillow'].some((keyword) => matcherTitle.includes(keyword))) {
    return 'Adult Sleep';
  } else if (
    ['coverlets', 'rest', 'baby'].some((keyword) =>
      matcherTitle.includes(keyword)
    )
  ) {
    return 'Babies & Kids Sleep';
  } else {
    return 'Everyone';
  }
}

async function hashEmail(email) {
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

async function hashPhone(phone) {
  const encoder = new TextEncoder();
  const data = encoder.encode(phone);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}