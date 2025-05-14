const { getOrderSKU, refreshAccessToken, markOrderShipped, getOrderDetail } = require('./shopee');

// ...rest of your code...

app.post('/api/redeem', async (req, res) => {
  const { orderNumber } = req.body;
  if (!orderNumber) {
    return res.status(400).json({ success: false, message: 'Order number is required.' });
  }

  let tokens = loadTokens();
  let orderDetail;
  let triedRefresh = false;

  while (true) {
    try {
      orderDetail = await getOrderDetail(orderNumber, tokens.access_token);
      break; // Success!
    } catch (err) {
      if (
        !triedRefresh &&
        err.message &&
        (
          err.message.toLowerCase().includes('invalid access_token') ||
          err.message.toLowerCase().includes('invalid_acceess_token')
        )
      ) {
        triedRefresh = true;
        try {
          const newTokens = await refreshAccessToken(tokens.refresh_token);
          tokens = { ...tokens, ...newTokens };
          saveTokens(tokens);
          continue; // Retry with new token
        } catch (refreshErr) {
          return res.status(500).json({ success: false, message: 'Failed to refresh access token.' });
        }
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  try {
    const skus = orderDetail.item_list.map(item => item.item_sku);
    const courses = [];
    for (const sku of skus) {
      const course = await getCourseLink(sku);
      if (course && course.link) {
        courses.push({ sku, ...course });
      }
    }

    let shipWarning = null;
    let shipStatus = null;
    if (courses.length > 0) {
      // Log the redemption
      redemptionLogs.push({
        orderNumber,
        skus,
        courses,
        redeemedAt: new Date().toISOString()
      });

      // Only try to mark as shipped if status is READY_TO_SHIP
      if (orderDetail.order_status === 'READY_TO_SHIP') {
        try {
          await markOrderShipped(orderNumber, tokens.access_token);
          shipStatus = 'shipped';
        } catch (shipErr) {
          shipWarning = shipErr.message;
          shipStatus = 'ship_failed';
          console.error('Failed to mark order as shipped:', shipWarning);
        }
      } else {
        shipStatus = 'not_ready';
        shipWarning = `Order status is "${orderDetail.order_status}". Cannot mark as shipped.`;
      }

      res.json({ success: true, courses, shipStatus, shipWarning });
    } else {
      res.json({ success: false, message: 'No courses found for these SKUs.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
