const express = require('express');
const mongoose = require("mongoose")
const router = express.Router();


const UserController = require('../controllers/userController')
const ProductController = require('../controllers/productController')
const CartController = require("../controllers/cartController")
const OrderController = require("../controllers/orderController")

//================================USER===================================


router.post("/register", UserController.createUser)
router.post("/login", UserController.login)
router.get("/user/:userId/profile", UserController.getUser)
router.put("/user/:userId/profile", UserController.updateUser)


//============================PRODUCT====================================


router.post("/products", ProductController.createProduct)
router.get("/products", ProductController.getProductByQuery)
router.get("/products/:productId", ProductController.getProductByParams)
router.delete("/products/:productId", ProductController.deleteProduct)
router.put("/products/:productId", ProductController.updateProduct)


//============================CART=======================================


router.post("/users/:userId/cart", CartController.addToCart)
router.put("/users/:userId/cart", CartController.addToCart)
router.get("/users/:userId/cart", CartController.addToCart)
router.delete("/users/:userId/cart", CartController.addToCart)


//============================ORDER=======================================


router.post("/users/:userId/orders", OrderController.createOrder)
router.put("/users/:userId/orders", OrderController.updateOrder)


// =================================================================


module.exports = router