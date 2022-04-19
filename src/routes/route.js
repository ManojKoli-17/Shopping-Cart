const express = require('express');
const mongoose = require("mongoose")
const router = express.Router();


const UserController = require('../controllers/userController')
const ProductController = require('../controllers/productController')
const CartController = require("../controllers/cartController")
const OrderController = require("../controllers/orderController")

const middleWare = require("../middlewares/userMiddleware")

//================================USER===================================


router.post("/register", UserController.createUser)
router.post("/login", UserController.login)
router.get("/user/:userId/profile",middleWare.mid1, UserController.getUser)
router.put("/user/:userId/profile",middleWare.mid1, UserController.updateUser)


//============================PRODUCT====================================


router.post("/products", ProductController.createProduct)
router.get("/products", ProductController.getProductByQuery)
router.get("/products/:productId", ProductController.getProductByParams)
router.delete("/products/:productId", ProductController.deleteProduct)
router.put("/products/:productId", ProductController.updateProduct)


//============================CART=======================================


router.post("/users/:userId/cart", CartController.addToCart)
// router.post("/users/:userId/cart",middleWare.mid1, CartController.addToCart)
router.put("/users/:userId/cart", CartController.updateCart)
// router.put("/users/:userId/cart",middleWare.mid1, CartController.updateCart)
router.get("/users/:userId/cart",middleWare.mid1, CartController.getCart)
router.delete("/users/:userId/cart",middleWare.mid1, CartController.deleteCart)


//============================ORDER=======================================


router.post("/users/:userId/orders",middleWare.mid1, OrderController.createOrder)
router.put("/users/:userId/orders",middleWare.mid1, OrderController.updateOrder)


// =================================================================


module.exports = router