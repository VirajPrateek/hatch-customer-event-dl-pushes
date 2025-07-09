//Initialize GTM tag
(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-PZ5FBSW');

console.log('🏷️ GTM-PZ5FBSW Loaded via Shopify Pixels');

//subscribe to events
// analytics.subscribe('checkout_completed', (event) => {
//   window.dataLayer.push({
//     event: 'checkout_completed',
//     timestamp: event.timestamp,
//     id: event.id,
//     token: event.data.checkout.token,
//     url: event.context.document.location.href,
//     client_id: event.clientId,
//     email: event.data.checkout.email,
//     phone: event.data.checkout.phone,
//     first_name: event.data.checkout.shippingAddress.firstName,
//     last_name: event.data.checkout.shippingAddress.lastName,
//     address1: event.data.checkout.shippingAddress.address1,
//     address2: event.data.checkout.shippingAddress.address2,
//     city: event.data.checkout.shippingAddress.city,
//     country: event.data.checkout.shippingAddress.country,
//     countryCode: event.data.checkout.shippingAddress.countryCode,
//     province: event.data.checkout.shippingAddress.province,
//     provinceCode: event.data.checkout.shippingAddress.provinceCode,
//     zip: event.data.checkout.shippingAddress.zip,
//     orderId: event.data.checkout.order.id,
//     currency: event.data.checkout.currencyCode,
//     subtotal: event.data.checkout.subtotalPrice.amount,
//     shipping: event.data.checkout.shippingLine.price.amount,
//     value: event.data.checkout.totalPrice.amount,
//     tax: event.data.checkout.totalTax.amount,
//   });
// });

analytics.subscribe('page_viewed', (evt) => {
  console.info('[lib/gtm/shopify-pixel-track.js] page_viewed');
  // We are using the context object to get the current document
  // Web Pixels are sandboxed and do not have access to the proper window for standard DOM access
  const domDocument = evt.context.document;

  //   path: domDocument.location.pathname,
  //   url: domDocument.location.href,
  //   title:
  //   referrer: domDocument.referrer,
  //   search: domDocument.location.search,

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

// RS 032924 - commenting out b/c likely a dupe of begin_checkout on hatch.co cart 
// analytics.subscribe('checkout_started', (event) => {
//   const checkout = event.data.checkout;

//   const coupon = _hatch_gtm_extractCouponFromDiscountApplications({
//     discountApplications: event.data.checkout.discountApplications,
//   });
//   const discountTotal = _hatch_gtm_getTotalDiscount(
//     event.data.checkout.discountApplications
//   );
//   const products = _hatch_gtm_getProductsFromLineItems(
//     event.data.checkout.lineItems
//   );
//   const items = _hatch_gtm_getItemsFromLineItems(event.data.checkout.lineItems);
//   console.info('[lib/gtm/shopify-pixel-track.js] checkout_started');

  // dataLayer.push({
  //   event: 'ecommEvent',
  //   event_name: 'checkout_started',
  //   ecommerce: {
  //     currencyCode: checkout.currencyCode,
  //     value: checkout.totalPrice.amount.toFixed(2),
  //     items,
  //     discount_total: discountTotal.toFixed(2),
  //     coupon,
  //     order_id: checkout.order.id,
  //     checkout_id: checkout.token,
  //     checkout: {
  //       actionField: {
  //         step: 0,
  //       },
  //       products,
  //     },
  //   },
  // });
// });

analytics.subscribe('checkout_contact_info_submitted', (event) => {
  const checkout = event.data.checkout;

  const coupon = _hatch_gtm_extractCouponFromDiscountApplications({
    discountApplications: event.data.checkout.discountApplications,
  });
  const discountTotal = _hatch_gtm_getTotalDiscount(
    event.data.checkout.discountApplications
  );
  const products = _hatch_gtm_getProductsFromLineItems(
    event.data.checkout.lineItems
  );
  const items = _hatch_gtm_getItemsFromLineItems(event.data.checkout.lineItems);
  console.info(
    '[lib/gtm/shopify-pixel-track.js] checkout_contact_info_submitted'
  );
  //   rudderanalytics.track('Checkout Step Completed', {
  //     checkout_id: checkout.token,
  dataLayer.push({
    event: 'ecommEvent',
    event_name: 'add_contact_info',
    ecommerce: {
      currencyCode: checkout.currencyCode,
      value: checkout.totalPrice.amount.toFixed(2),
      items,
      discount_total: discountTotal.toFixed(2),
      coupon,
      order_id: checkout.order.id,
      checkout_id: checkout.token,
      checkout: {
        actionField: {
          step: 1,
        },
        products,
      },
    },
  });
});

analytics.subscribe('checkout_address_info_submitted', (event) => {
  const checkout = event.data.checkout;

  const coupon = _hatch_gtm_extractCouponFromDiscountApplications({
    discountApplications: event.data.checkout.discountApplications,
  });
  const discountTotal = _hatch_gtm_getTotalDiscount(
    event.data.checkout.discountApplications
  );
  const products = _hatch_gtm_getProductsFromLineItems(
    event.data.checkout.lineItems
  );
  const items = _hatch_gtm_getItemsFromLineItems(event.data.checkout.lineItems);
  console.info(
    '[lib/gtm/shopify-pixel-track.js] checkout_address_info_submitted'
  );

  dataLayer.push({
    event: 'ecommEvent',
    event_name: 'add_address_info',
    ecommerce: {
      currencyCode: checkout.currencyCode,
      value: checkout.totalPrice.amount.toFixed(2),
      items,
      discount_total: discountTotal.toFixed(2),
      coupon,
      order_id: checkout.order.id,
      checkout_id: checkout.token,
      checkout: {
        actionField: {
          step: 2,
        },
        products,
      },
    },
  });
});

analytics.subscribe('checkout_shipping_info_submitted', (event) => {
  const checkout = event.data.checkout;

  const coupon = _hatch_gtm_extractCouponFromDiscountApplications({
    discountApplications: event.data.checkout.discountApplications,
  });
  const discountTotal = _hatch_gtm_getTotalDiscount(
    event.data.checkout.discountApplications
  );
  const products = _hatch_gtm_getProductsFromLineItems(
    event.data.checkout.lineItems
  );
  const items = _hatch_gtm_getItemsFromLineItems(event.data.checkout.lineItems);
  console.info(
    '[lib/gtm/shopify-pixel-track.js] checkout_shipping_info_submitted'
  );

  dataLayer.push({
    event: 'ecommEvent',
    event_name: 'add_shipping_info',
    ecommerce: {
      currencyCode: checkout.currencyCode,
      value: checkout.totalPrice.amount.toFixed(2),
      items,
      discount_total: discountTotal.toFixed(2),
      coupon,
      order_id: checkout.order.id,
      checkout_id: checkout.token,
      checkout: {
        actionField: {
          step: 3,
        },
        products,
      },
    },
  });
});

analytics.subscribe('payment_info_submitted', (event) => {
  const checkout = event.data.checkout;

  const coupon = _hatch_gtm_extractCouponFromDiscountApplications({
    discountApplications: event.data.checkout.discountApplications,
  });
  const discountTotal = _hatch_gtm_getTotalDiscount(
    event.data.checkout.discountApplications
  );
  const products = _hatch_gtm_getProductsFromLineItems(
    event.data.checkout.lineItems
  );
  const items = _hatch_gtm_getItemsFromLineItems(event.data.checkout.lineItems);
  console.info('[lib/gtm/shopify-pixel-track.js] payment_info_submitted');

  dataLayer.push({
    event: 'ecommEvent',
    event_name: 'add_payment_info',
    ecommerce: {
      currencyCode: checkout.currencyCode,
      value: checkout.totalPrice.amount.toFixed(2),
      items,
      discount_total: discountTotal.toFixed(2),
      coupon,
      order_id: checkout.order.id,
      checkout_id: checkout.token,
      checkout: {
        actionField: {
          step: 4,
        },
        products,
      },
    },
  });
});

analytics.subscribe('checkout_completed', async (event) => {
  const checkout = event.data.checkout;

  const coupon = _hatch_gtm_extractCouponFromDiscountApplications({
    discountApplications: event.data.checkout.discountApplications,
  });
  const discountTotal = _hatch_gtm_getTotalDiscount(
    event.data.checkout.discountApplications
  );
  const products = _hatch_gtm_getProductsFromLineItems(
    event.data.checkout.lineItems
  );
  const items = _hatch_gtm_getItemsFromLineItems(event.data.checkout.lineItems);
  console.info('[lib/gtm/shopify-pixel-track.js] checkout_completed');

  console.log('checkout_completed in GTM shopify pixels');

  console.log('email_hashed:'+ await hashEmail(checkout.email));
  console.log('phone_hashed:'+ await hashPhone(checkout.phone));

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
      checkout_id: checkout.token,
      items,
      quantity_total: checkout.lineItems.length,
      discount_total: discountTotal.toFixed(2),
      coupon,
      // name thru zip are req for Facebook and Google Ads enhanced conversions
      first_name: checkout.shippingAddress.firstName,
      last_name: checkout.shippingAddress.lastName,
      phone: checkout.phone,
      city: checkout.shippingAddress.city,
      state: checkout.shippingAddress.province,
      country: checkout.shippingAddress.country,
      zip: checkout.shippingAddress.zip,
      checkout: {
        actionField: {
          step: 5,
        },
        products,
      },
    },
  });  
});

// Helper functions

function _hatch_gtm_extractCouponFromDiscountApplications({
  discountApplications,
}) {
  return (discountApplications ?? []).map((d) => d.title).join(',');
}

function _hatch_gtm_getItemsFromLineItems(lineItems) {
  return lineItems.map(({ variant, quantity }) => {
    const { product } = variant;
    const hasVariantTitle = variant.title && variant.title !== 'Default Title';
    // const handle = product.url.replace('/products/', '');
    return {
      ['item_id']: variant.sku,
      ['item_name']: product.title,
      currency: variant.price.currencyCode,
      ['item_brand']: 'Hatch',
      ['item_category']: _hatch_gtm_getProductCategory(product.title),
      ['item_variant']: hasVariantTitle ? variant.title : '',
      price: variant.price.amount.toFixed(2), // Return a string
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

function _hatch_gtm_getProductsFromLineItems(lineItems) {
  return lineItems.map(({ variant, discountAllocations, quantity }) => {
    const { product } = variant;
    const hasVariantTitle = variant.title && variant.title !== 'Default Title';
    // const handle = product.url.replace('/products/', '');
    return {
      name: product.title,
      id: variant.sku,
      price: variant.price.amount.toFixed(2), // Return a string
      currencyCode: variant.price.currencyCode,
      brand: 'Hatch',
      quantity,
      variant: hasVariantTitle ? variant.title : '',
      category: _hatch_gtm_getProductCategory(product.title),
      discount: discountAllocations.reduce(
        (acc, { amount: { amount } }) => acc + amount,
        0
      ),
    };
  });
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
