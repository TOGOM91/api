const User = require("../models/Order");

const getOrders = async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
};

const createOrder = async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.status(201).json(order);
};

module.exports = { getOrders, createOrder };
