const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// === CONFIG ===
const PARTNER_ID = '2009397';
const PARTNER_KEY = '545777637371464f6a4d476d72636656585749486a566c5763626f76624e6459';
const SHOP_ID = '339683430';
const TOKENS_PATH = path.join(__dirname, 'tokens.json');

// === UTILS ===
function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function getTokens() {
  return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
}

function saveTokens(tokens) {
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
}

// === TOKEN REFRESH ===
async function refreshAccessToken(refreshToken) {
  const pathStr = '/api/v2/auth/access_token/get';
  const timestamp = getTimestamp();
  const baseString = `${PARTNER_ID}${pathStr}${timestamp}`;
  const sign = crypto.createHmac('sha256', PARTNER_KEY).update(baseString).digest('hex');
  const url = `https://partner.shopeemobile.com${pathStr}?partner_id=${PARTNER_ID}&timestamp=${timestamp}&sign=${sign}`;

  const body = {
    refresh_token: refreshToken,
    partner_id: Number(PARTNER_ID),
    shop_id: Number(SHOP_ID),
  };

  const response = await axios.post(url, body, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.data.error) {
    throw new Error(`Shopee refresh error: ${response.data.error} - ${response.data.message}`);
  }

  // Save new tokens
  const newTokens = {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
  };
  saveTokens(newTokens);
  console.log('Shopee access token refreshed!');
  return newTokens;
}

// === GENERIC WRAPPER FOR AUTO-REFRESH ===
async function withShopeeTokenRetry(apiFn) {
  let tokens = getTokens();
  try {
    return await apiFn(tokens.access_token);
  } catch (err) {
    // Check for Shopee's typo error
    const errData = err.response?.data;
    if (errData && errData.error === 'invalid_acceess_token') {
      // Try refresh
      console.warn('Access token expired, refreshing...');
      tokens = await refreshAccessToken(tokens.refresh_token);
      // Retry once with new token
      return await apiFn(tokens.access_token);
    }
    throw err;
  }
}

// === API CALLS ===
async function getOrderDetail(orderNumber) {
  return withShopeeTokenRetry(async (accessToken) => {
    const pathStr = '/api/v2/order/get_order_detail';
    const timestamp = getTimestamp();
    const baseString = `${PARTNER_ID}${pathStr}${timestamp}${accessToken}${SHOP_ID}`;
    const sign = crypto.createHmac('sha256', PARTNER_KEY).update(baseString).digest('hex');
    const url = `https://partner.shopeemobile.com${pathStr}?partner_id=${PARTNER_ID}&shop_id=${SHOP_ID}&timestamp=${timestamp}&access_token=${accessToken}&sign=${sign}&order_sn_list=${orderNumber}&response_optional_fields=item_list`;

    const response = await axios.get(url, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.data.error) {
      throw new Error(`Shopee API error: ${response.data.error} - ${response.data.message}`);
    }

    const orderList = response.data.response?.order_list;
    if (!orderList || !orderList[0]) {
      throw new Error('Order not found in Shopee response');
    }

    return orderList[0]; // Full order object
  });
}

async function getOrderSKU(orderNumber) {
  const order = await getOrderDetail(orderNumber);
  if (!order.item_list) throw new Error('No item_list in order');
  return order.item_list.map(item => item.item_sku);
}

async function markOrderShipped(orderNumber) {
  return withShopeeTokenRetry(async (accessToken) => {
    const pathStr = '/api/v2/logistics/ship_order';
    const timestamp = getTimestamp();

    const bodyObj = {
      order_sn: orderNumber,
      non_integrated: {
        tracking_number: `VIRTUAL-${orderNumber}`
      }
    };

    const baseString = `${PARTNER_ID}${pathStr}${timestamp}${accessToken}${SHOP_ID}`;
    const sign = crypto.createHmac('sha256', PARTNER_KEY).update(baseString).digest('hex');

    const url = `https://partner.shopeemobile.com${pathStr}?partner_id=${PARTNER_ID}&shop_id=${SHOP_ID}&timestamp=${timestamp}&access_token=${accessToken}&sign=${sign}`;

    const response = await axios.post(url, bodyObj, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.error) {
      throw new Error(`Shopee ship error: ${response.data.error} - ${response.data.message}`);
    }

    return response.data;
  });
}

// === EXPORTS ===
module.exports = {
  getOrderSKU,
  getOrderDetail,
  markOrderShipped,
  refreshAccessToken, // for manual use if needed
};