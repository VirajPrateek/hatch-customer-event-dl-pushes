// Sandbox Javascript imports
const getAllEventData = require('getAllEventData');
const getType = require('getType');
const sendHttpRequest = require('sendHttpRequest');
const JSON = require('JSON');
const Math = require('Math');
const getTimestampMillis = require('getTimestampMillis');
const sha256Sync = require('sha256Sync');
const getCookieValues = require('getCookieValues');
const setCookie = require('setCookie');
const parseUrl = require('parseUrl');
const makeInteger = require('makeInteger');
const makeString = require('makeString');
const logToConsole = require('logToConsole');


// CONSTANTS
const isLogEnabled = isLoggingEnabled();
const eventModel = getAllEventData();
if (isLogEnabled) logToConsole(JSON.stringify({'Tag Data': data}));
if (isLogEnabled) logToConsole(JSON.stringify({'Event Data': eventModel}));

// GA4 event names/types: https://support.google.com/analytics/answer/9267735
// Pinterest event names/types: https://developers.pinterest.com/docs/api/v5/#operation/events/create
const EVENT_NAME_MAPPINGS = {
  "add_to_cart": "add_to_cart",
  "addtocart": "add_to_cart",
  "purchase": "checkout",
  "buy": "checkout",
  "pay": "checkout",
  "payment": "checkout",
  "generate_lead": "lead",
  "submit_application": "lead",
  "contact": "lead",
  "page_view": "page_visit",
  "pageview": "page_visit",
  "pagevisit": "page_visit",
  "gtm.dom": "page_visit",
  "search": "search",
  "find_location": "search",
  "sign_up": "signup",
  "signup": "signup",
  "completeregistration": "signup",
  "viewcategory": "view_category",
  "viewcontent": "view_category",
  "view_item_list": "view_category",
  "watchvideo": "watch_video",
  "add_payment_info": "add_payment_info",// Incubeta overrride from "custom"
  "add_shipping_info": "custom",
  "add_to_wishlist": "custom",
  "begin_checkout": "initiate_checkout", // Incubeta overrride from "custom"
  "refund": "custom",
  "remove_from_cart": "custom",
  "select_item": "custom",
  "select_promotion": "custom",
  "view_cart": "custom",
  "view_item": "view_content", //// Incubeta overrride from "page_visit",
  "view_promotion": "custom"
};

const PARAM_VALUE_FORMAT = {
  "event_time": "integer",
  "event_id": "string",
  "num_items": "integer",
  "opt_out": "boolean",
  "wifi": "boolean",
  "value": "string",
  "em": "array-hashed",
  "ph": "array-hashed",
  "ge": "array-hashed",
  "db": "array-hashed",
  "fn": "array-hashed",
  "ln": "array-hashed",
  "ct": "array-hashed",
  "st": "array-hashed",
  "zp": "array-hashed",
  "country": "array-hashed",
  "hashed_maids": "array-hashed",
  "external_id": "array-hashed",
  "content_ids": "array",
  "contents": "json"
};

const DEFAULT_NAMED_PARTNER = 'ss-gtm';

const DEFAULT_ACTION_SOURCE = 'web';

const DEFAULT_EVENT_TIME = Math.round(getTimestampMillis() / 1000);

const DEFAULT_CLIENT_IP_ADDRESS = eventModel.ip_override;

const DEFAULT_CLIENT_USER_AGENT = eventModel.user_agent;

// FUNCTIONS
function isAlreadyHashed(input) {
  return input && (input.match('^[A-Fa-f0-9]{64}$') != null);
}

function hashFunction(input) {
  const type = getType(input);

  if (type == 'undefined' || input == 'undefined') {
    return undefined;
  }

  if (input == null || isAlreadyHashed(input)) {
    return input;
  }

  return sha256Sync(input.trim().toLowerCase(), {outputEncoding: 'hex'});
}

function getContentsFromItems(items) {
    return items.map(item => {
        return {
            "id": makeString((item.item_id) ? item.item_id : item.item_name),
            "item_price": makeString(item.price),
            "quantity": makeInteger(item.quantity),
        };
    });
}

function getContentIdsFromItems(items) {
    return JSON.stringify(items.map(item => {
        return makeString((item.item_id) ? item.item_id : item.item_name);
    }));
}

function getPinterestEventName(gtmEventName, toLowerCase) {
  let pinterestEventName;
  if (data.eventName === 'inherit') {
    if (toLowerCase) {
      gtmEventName = gtmEventName.trim().toLowerCase();
    }
    pinterestEventName = EVENT_NAME_MAPPINGS[gtmEventName] || gtmEventName;
  } else if ( data.eventName === 'pinterestEventName') {
    pinterestEventName = data.eventNameStandard;
  }
  return pinterestEventName;
}

function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
}

function convertToArrayOfStrings(input, hashIfNeeded) {
  if (input == null) {
    return input;
  }

  const type = getType(input);
  if (type == 'undefined' || input == 'undefined') {
    return undefined;
  }

  let arrayOfStrings = [];
  if (type == 'array') {
    arrayOfStrings = input.map((i) => makeString(i));
  }
  if (type == 'string') {
    let arrayOfObjs = replaceAll(input.toString().replace('[','').replace(']',''),'\"','').split(',');
    arrayOfStrings = arrayOfObjs.map((i) => makeString(i).trim()).filter(function(e) {
      return !(!e || e.length === 0 );
    });
  }

  return arrayOfStrings.map(item => {
    if (hashIfNeeded === true) {
      return hashFunction(item);
    }
    return item;
  });
}

function getBooleanFromString(input) {
  const type = getType(input);
  if (type == 'undefined' || input == 'undefined') {
    return undefined;
  }

  if (input == null) {
    return input;
  }

  return (typeof input === 'string' && (input.toLowerCase() === "true" || input.toLowerCase() === "false")) ? JSON.parse(input.toLowerCase()) : input;
}

function getJsonFromString(input) {
  const type = getType(input);
  if (type == 'undefined' || input == 'undefined') {
    return undefined;
  }

  if (input == null) {
    return input;
  }

  return (typeof input === 'string' && input.charAt(0) === '[' && input.charAt(input.length - 1) === ']' 
          && input.charAt(1) === '{' && input.charAt(input.length - 2) === '}') ? JSON.parse(input) : input;
}

function overrideEventData(event, data) {
  if (data.serverEventDataList) {
    data.serverEventDataList.forEach(d => {
      event[d.name] = d.value;
    });
  }
  if (data.userDataList) {
    data.userDataList.forEach(d => {
      event.user_data[d.name] = d.value;
    });
  }
  if (data.customDataList) {
    data.customDataList.forEach(d => {
      event.custom_data[d.name] = d.value;
    });
  }
}

function formatDataTypes(object) {
  for (let key in object) {
    if (object.hasOwnProperty(key)) {
        if (PARAM_VALUE_FORMAT[key] === 'string') object[key] = makeString(object[key]);
        if (PARAM_VALUE_FORMAT[key] === 'integer') object[key] = makeInteger(JSON.parse(object[key]));
        if (PARAM_VALUE_FORMAT[key] === 'boolean') object[key] = getBooleanFromString(object[key]);
        if (PARAM_VALUE_FORMAT[key] === 'array') object[key] = convertToArrayOfStrings(object[key], false);
        if (PARAM_VALUE_FORMAT[key] === 'array-hashed') object[key] = convertToArrayOfStrings(object[key], true);
        if (PARAM_VALUE_FORMAT[key] === 'json') object[key] = getJsonFromString(object[key]);
    }
  }
}

function isLoggingEnabled() {
  return (data.logMode === 'log') ? true : false;
}

// EVENT PARAMETERS
const event = {};
// event_name
event.event_name = getPinterestEventName(eventModel.event_name, true);
// action_source
event.action_source = eventModel.action_source ? eventModel.action_source : DEFAULT_ACTION_SOURCE;
// event_time
event.event_time = eventModel.event_time ? eventModel.event_time : DEFAULT_EVENT_TIME;
// event_id
if (eventModel.event_id) {
  event.event_id = eventModel.event_id;
}
// event_source_url
event.event_source_url = eventModel.event_source_url ? eventModel.event_source_url : eventModel.page_location;
// opt_out
if (eventModel.opt_out) {
  event.opt_out = eventModel.opt_out;
}
// partner_name
if (eventModel.partner_name) {
  event.partner_name = eventModel.partner_name;
}

// AUTHORIZATION PARAMETERS
const apiAccessToken = data.apiAccessToken;

// USER PARAMETERS (user_data)
event.user_data = {};
if (eventModel.user_data != null) {
  // em
  if (eventModel.user_data.email_address) {
    event.user_data.em = eventModel.user_data.email_address;
  }
  // ph
  if (eventModel.user_data.phone_number) {
    event.user_data.ph = eventModel.user_data.phone_number;
  }
  // ge
  if (eventModel.user_data.gender) {
    event.user_data.ge = eventModel.user_data.gender;
  }
  // db
  if (eventModel.user_data.date_of_birth) {
    event.user_data.db = eventModel.user_data.date_of_birth;
  }

  if (eventModel.user_data.address != null) {
    const addressData = eventModel.user_data.address;
    // fn
    event.user_data.fn = addressData.first_name;
    // ln
    event.user_data.ln = addressData.last_name;
    // ct
    event.user_data.ct = addressData.city;
    // st
    event.user_data.st = addressData.region;
    // zp
    event.user_data.zp = addressData.postal_code;
    // country
    event.user_data.country = addressData.country;
  }
  // hashed_maids
  if (eventModel.user_data.hashed_maids) {
    event.user_data.hashed_maids = eventModel.user_data.hashed_maids;
  }
  // external_id
  if (eventModel.user_data.external_id) {
    event.user_data.external_id = eventModel.user_data.external_id;
  }
  // click_id
  if (eventModel.user_data.click_id) {
    event.user_data.click_id = eventModel.user_data.click_id;
  }
}

// client_ip_address / default
event.user_data.client_ip_address = (eventModel.user_data && eventModel.user_data.client_ip_address) ? eventModel.user_data.client_ip_address : DEFAULT_CLIENT_IP_ADDRESS;
// client_user_agent / default
event.user_data.client_user_agent = (eventModel.user_data && eventModel.user_data.client_user_agent) ? eventModel.user_data.client_user_agent : DEFAULT_CLIENT_USER_AGENT;

// CUSTOM PARAMETERS (custom_data)
event.custom_data = {};
// currency
if (eventModel.currency) {
  event.custom_data.currency = eventModel.currency;
}
// value
if (eventModel.value) {
  event.custom_data.value = eventModel.value;
}
// content_name
if (eventModel.content_name) {
  event.custom_data.content_name = eventModel.content_name;
}
// content_category
if (eventModel.content_category) {
  event.custom_data.content_category = eventModel.content_category;
}
// content_brand
if (eventModel.content_brand) {
  event.custom_data.content_brand = eventModel.content_brand;
}
// content_ids
if (eventModel.content_ids) {
  event.custom_data.content_ids = eventModel.content_ids;
} else if (eventModel.items) {
  event.custom_data.content_ids = getContentIdsFromItems(eventModel.items);
}
// contents
if (eventModel.contents) {
  event.custom_data.contents = eventModel.contents;
} else if (eventModel.items) {
  event.custom_data.contents = getContentsFromItems(eventModel.items);
}
// num_items
if (eventModel.num_items) {
  event.custom_data.num_items = eventModel.num_items;
} else if (eventModel.items) {
  event.custom_data.num_items = eventModel.items.length;
}
// order_id
if (eventModel.order_id) {
  event.custom_data.order_id = eventModel.order_id;
}
// search_string
if (eventModel.search_string) {
  event.custom_data.search_string = eventModel.search_string;
}
// opt_out_type
if (eventModel.opt_out_type) {
  event.custom_data.opt_out_type = eventModel.opt_out_type;
}
// app_id
if (eventModel.app_id) {
  event.app_id = eventModel.app_id;
}
// app_name
if (eventModel.app_name) {
  event.app_name = eventModel.app_name;
}
// app_version
if (eventModel.app_version) {
  event.app_version = eventModel.app_version;
}
// device_brand
if (eventModel.device_brand) {
  event.device_brand = eventModel.device_brand;
}
// device_carrier
if (eventModel.device_carrier) {
  event.device_carrier = eventModel.device_carrier;
}
// device_model
if (eventModel.device_model) {
  event.device_model = eventModel.device_model;
}
// device_type
if (eventModel.device_type) {
  event.device_type = eventModel.device_type;
}
// os_version
if (eventModel.os_version) {
  event.os_version = eventModel.os_version;
}
// wifi
if (eventModel.wifi) {
  event.wifi = eventModel.wifi;
}
// language
if (eventModel.language) {
  event.language = eventModel.language.slice(0,2);
}

// np
event.custom_data.np = DEFAULT_NAMED_PARTNER;

// OVERRIDE EVENT DATA
if (data.overrideMode) {
  overrideEventData(event, data);
}

// ENSURE CORRECT FORMAT
formatDataTypes(event);
if (event.user_data) formatDataTypes(event.user_data);
if (event.custom_data) formatDataTypes(event.custom_data);

// PINTEREST API ENDPOINT
const API_ENDPOINT = 'https://api.pinterest.com/v5/ad_accounts/';
var requestEndpoint = [API_ENDPOINT, data.advertiserId, '/events'].join('');
if (data.testMode) {
  requestEndpoint = [requestEndpoint,'?test=true'].join('');
}
const eventRequest = {data: [event]};
if (isLogEnabled) {
  logToConsole(JSON.stringify({
    'Name': 'Pinterest Conversions API',
    'Type': 'Request',
    'RequestMethod': 'POST',
    'RequestUrl': requestEndpoint,
    'AdvertiserId': data.advertiserId,
    'EventName': event.event_name,
    'RequestBody (payload)': eventRequest
  }));
}

// Posting to Pinterest Conversions API endpoint
const requestHeaders = {
  headers: {'content-type': 'application/json',
            'Authorization':'Bearer ' + apiAccessToken},
  method: 'POST'};

sendHttpRequest(requestEndpoint,(responseStatusCode, responseHeaders, responseBody) => {
  if (isLogEnabled) {
    logToConsole(JSON.stringify({
      'Name': 'Pinterest Conversions API',
      'Type': 'Response',
      'AdvertiserId': data.advertiserId,
      'EventName': event.event_name,
      'ResponseStatusCode': responseStatusCode,
      'ResponseHeaders': responseHeaders,
      'ResponseBody': responseBody
    }));
  }
  if (responseStatusCode >= 200 && responseStatusCode < 300) {
      data.gtmOnSuccess();
    } else {
      data.gtmOnFailure();
    }
  },
  requestHeaders,
  JSON.stringify(eventRequest)
);