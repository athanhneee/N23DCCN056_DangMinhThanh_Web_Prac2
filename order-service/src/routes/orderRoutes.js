const router = require("express").Router();

const {
  createOrder,
  getOrdersByCustomer,
  updateOrderStatus,
} = require("../controllers/orderController");
const {
  createOrderValidation,
  getOrdersByCustomerValidation,
  updateOrderStatusValidation,
} = require("../middleware/validate");

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order management operations
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
router.post("/", createOrderValidation, createOrder);

/**
 * @swagger
 * /api/orders/customer/{customerId}:
 *   get:
 *     summary: Get orders by customer id
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipping, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Orders returned successfully
 */
router.get("/customer/:customerId", getOrdersByCustomerValidation, getOrdersByCustomer);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status by Mongo _id or orderCode
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id or generated orderCode such as ORD-20260411-0001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipping, delivered, cancelled]
 *           example:
 *             status: confirmed
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */
router.patch("/:id/status", updateOrderStatusValidation, updateOrderStatus);

module.exports = router;
