const orderService = require('../services/order.service');

const placeOrder = async (req, res, next) => {
  try {
    const order = await orderService.placeOrder(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Order placed', data: order });
  } catch (err) { next(err); }
};

const getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

module.exports = { placeOrder, getAllOrders, getOrderById, updateOrderStatus };
