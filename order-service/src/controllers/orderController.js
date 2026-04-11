const mongoose = require("mongoose");

const Order = require("../models/Order");

async function createOrder(req, res, next) {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      items,
      shippingAddress,
      note,
    } = req.body;

    const processedItems = items.map((item) => ({
      ...item,
      subtotal: item.price * item.quantity,
    }));

    const totalAmount = processedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    const order = await Order.create({
      customerId,
      customerName,
      customerEmail,
      items: processedItems,
      totalAmount,
      shippingAddress,
      note,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

async function getOrdersByCustomer(req, res, next) {
  try {
    const customerId = Number.parseInt(req.params.customerId, 10);
    const page = Number.parseInt(req.query.page || "1", 10);
    const limit = Number.parseInt(req.query.limit || "10", 10);
    const skip = (page - 1) * limit;
    const filter = { customerId };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const identifier = req.params.id.trim();
    const filter = mongoose.isValidObjectId(identifier)
      ? { $or: [{ _id: identifier }, { orderCode: identifier }] }
      : { orderCode: identifier };

    const order = await Order.findOneAndUpdate(
      filter,
      { status: req.body.status },
      { new: true, runValidators: true },
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for the provided id or orderCode.",
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getOrdersByCustomer,
  updateOrderStatus,
};
