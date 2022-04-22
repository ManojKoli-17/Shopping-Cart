const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const middleware = require('../middlewares/auth')

// Users
router.post('/register', userController.createUser)
router.post('/login', userController.userLogin)
router.get('/user/:userId/profile', middleware.middleware, userController.getUserProfile)
router.put('/user/:userId/profile', middleware.middleware, userController.updateProfile)

// Products 
router.post('/products', productController.productCreation)
router.get('/products',productController.getAllProducts)
router.get('/products/:productId', productController.getProductsById)
router.put('/products/:productId', productController.updateProduct)
router.delete('/products/:productId', productController.deleteProduct)

// Cart
router.post('/users/:userId/cart',middleware.middleware,cartController.createCart)
router.get('/users/:userId/cart',middleware.middleware,cartController.getCart)
router.put('/users/:userId/cart',middleware.middleware,cartController.updateCart)
router.delete('/users/:userId/cart',middleware.middleware,cartController.deleteCart)

// Order

router.post("/users/:userId/orders", middleware.middleware, orderController.createOrder);
router.put("/users/:userId/orders",middleware.middleware, orderController.updateOrder);

module.exports = router;