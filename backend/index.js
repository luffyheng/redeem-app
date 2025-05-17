const express = require('express');
const cors = require('cors');
const { getOrderSKU, markOrderShipped, getOrderDetail } = require('./shopee');
const { getCourseLink } = require('./googleSheet');

const app = express();
app.use(cors());
app.use(express.json());

const redemptionLogs = [];

app.post('/api/redeem', async (req, res) => {
  const { orderNumber } = req.body;
  if (!orderNumber) {
    return res.status(400).json({ success: false, message: 'Order number is required.' });
  }

  let orderDetail;
  try {
    orderDetail = await getOrderDetail(orderNumber); // No access token needed
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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
          await markOrderShipped(orderNumber); // No access token needed
          shipStatus = 'shipped';
        } catch (shipErr) {
          shipWarning = shipErr.message;
          shipStatus = 'ship_failed';
          console.error('Failed to mark order as shipped:', shipWarning);
        }
      } else {
        shipStatus = 'not_ready';
        shipWarning = Order status is "${orderDetail.order_status}". Cannot mark as shipped.;
      }

      res.json({ success: true, courses, shipStatus, shipWarning });
    } else {
      res.json({ success: false, message: 'No courses found for these SKUs.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// (Optional) Admin endpoint to view logs
app.get('/api/admin/logs', (req, res) => {
  res.json({ logs: redemptionLogs });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(Backend running on port ${PORT});
});