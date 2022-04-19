const CartModel = require("../models/cartModel");
const UserModel = require("../models/userModel");
const ProductModel = require("../models/productModel");




const isValidObjId=/^[0-9a-fA-F]{24}$/

const isValid = function (value) {
  if (typeof value === "undefined" || typeof value === "null") {
    return false;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return true;
  }
};

// ============================================ADD TO CART ===============================================

const addToCart = async(req, res)=>{
    try {
        const data=req.body
        const userIdbyParams=req.params.userId
        let {userId, productId, cartId} = data

        if (!isValidObjId.test(userId)) {
            return res
              .status(400)
              .send({ status: false, message: "please provide valid UserId" });
          }
        if (!isValid(userId)) {
            res.status(400).send({ status: false, message: 'please provide userId' })
            return
          }

        if(userIdbyParams!==data.userId){
              res.status(400).send({status:false, message:"Plz Provide Similar UserId's in params and body"})
              return  
         }


        const isProductPresent=await ProductModel.findOne({_id:productId, isDeleted:false})

        if(!isProductPresent){
            return res.status(404).send({status: false, message: `Product not found by this productId ${productId}`})
        }

        if (data.hasOwnProperty("cartId")) {
            
            if (!isValid(cartId)) {
              return res.status(400).send({ status: false, message: "cartId could not be blank" });
            }

            if (!isValidObjId.test(cartId)) {
                return res.status(400).send({ status: false, message: "cartId  is not valid" });
              }

            const isCartIdPresent = await CartModel.findById(cartId);

            if (!isCartIdPresent) {
                return res.status(404).send({ status: false, message: `Cart not found by this cartId ${cartId}` });
            }

            const cartIdForUser = await CartModel.findOne({ userId: userId });

            if (!cartIdForUser) {
              return res.status(403).send({
                status: false,
                message: "User is not allowed to update this cart",
              });
            }

            // if(req.user!==cartIdForUser.userId){
            //   res.status(401).send({status:false, message:"You are not authorized to add product to this cart"})
            //   return
            // }

            if (cartId !== cartIdForUser._id.toString()) {
                return res.status(403).send({
                  status: false,
                  message: "User is not allowed to update this cart",
                });
              }

            const isProductPresentInCart = isCartIdPresent.items.map(
            (product) => (product["productId"] = product["productId"].toString()));

            if (isProductPresentInCart.includes(productId)) {
          
                    const updateExistingProductQuantity = await CartModel.findOneAndUpdate({ _id: cartId, "items.productId":productId},
                    {$inc: {totalPrice: +isProductPresent.price,"items.$.quantity": +1,},}, { new: true });

                    return res.status(200).send({ status: true, message: "Product quantity updated to cart",data: updateExistingProductQuantity,
                  });
                }

            const addNewProductInItems = await CartModel.findOneAndUpdate(
                    { _id: cartId },
                    {
                      $addToSet: { items: { productId: productId, quantity: 1 } },
                      $inc: { totalItems: +1, totalPrice: +isProductPresent.price },
                    },
                    { new: true }
                );

                return res.status(200).send({status: true, message: "Item updated to cart", data: addNewProductInItems,});

        }
        else{
            const isCartPresentForUser = await CartModel.findOne({ userId: userId });

            if (isCartPresentForUser) {
              return res.status(400).send({status: false, message: "cart already exist, provide cartId in req. body"});
            }

            // if(req.user!==isCartPresentForUser.userId){
            //   res.status(401).send({status:false, message:"You are not authorized to create and update the cart"})
            //   return
            // }

            const productData = 
            {
              productId: productId,
              quantity: 1
            }

            const cartData = {
                userId: userId,
                items: [productData],
                totalPrice: isProductPresent.price,
                totalItems: 1,
              };

            const addedToCart = await CartModel.create(cartData);

            return res.status(201).send({ status: true, message: "New cart created and product added to cart", data: addedToCart });
        }
        }

         catch (err) {
        res.status(500).send({status:false, message:err.message})
    }
}

// ============================================UPDATE CART===============================================

const updateCart = async(req, res)=>{
    try {
                let userId = req.params.userId
                let requestBody = req.body;
        
                if (!isValidObjId.test(userId)) {
                    return res.status(400).send({ status: false, message: "Invalid userId in body" })
                }
        
                let findUser = await UserModel.findOne({ _id: userId })
                if (!findUser) {
                    return res.status(400).send({ status: false, message: "UserId does not exits" })
                }

                const userInCart = await CartModel.findOne({ userId: userId });
        
                // // Authentication & authorization
                // if (userInCart.userId != req.user) {
                //     res.status(401).send({ status: false, message: "Unauthorized access! You are not authorized to update this cart" });
                //     return
                // }
        
                const { cartId, productId, removeProduct } = requestBody
                // if (!validator.isValidRequestBody(requestBody)) {
                //     return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide cart details.' })
                // }
        
                if (!isValidObjId.test(cartId)) {
                    return res.status(400).send({ status: false, message: "Invalid cartId in body" })
                }
                let findCart = await CartModel.findById({ _id: cartId })
                if (!findCart) {
                    return res.status(400).send({ status: false, message: "cartId does not exists" })
                }
        
                if (!isValidObjId.test(productId)) {
                    return res.status(400).send({ status: false, message: "Invalid productId in body" })
                }
                let findProduct = await ProductModel.findOne({ _id: productId, isDeleted: false })
                if (!findProduct) {
                    return res.status(400).send({ status: false, message: "productId does not exists" })
                }
        
                let isProductinCart = await CartModel.findOne({ items: { $elemMatch: { productId: productId } } })
                if (!isProductinCart) {
                    return res.status(400).send({ status: false, message: `This ${productId} product does not exists in the cart` })
                }
        

                if (!(!isNaN(Number(removeProduct)))) {
                    return res.status(400).send({ status: false, message: `removeProduct should be a valid number either 0 or 1` })
                }
        

                if (!((removeProduct === 0) || (removeProduct === 1))) {
                    return res.status(400).send({ status: false, message: 'removeProduct should be 0 (product is to be removed) or 1(quantity has to be decremented by 1) ' })
                }
        
                let findQuantity = findCart.items.find(x => x.productId.toString() === productId)

        
                if (removeProduct === 0) {
                    let totalAmount = findCart.totalPrice - (findProduct.price * findQuantity.quantity) 
        
                    await CartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true })
        
                    let quantity = findCart.totalItems - 1
                    let data = await CartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true }) //update the cart with total items and totalprice
        
                    return res.status(200).send({ status: true, message: `${productId} is been removed`, data: data })
                }
        
                // decrement quantity
                let totalAmount = findCart.totalPrice - findProduct.price
                let itemsArr = findCart.items
        
                for (i in itemsArr) {
                    if (itemsArr[i].productId.toString() == productId) {
                        itemsArr[i].quantity = itemsArr[i].quantity - 1
        
                        if (itemsArr[i].quantity < 1) {
                            await CartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true })
                            let quantity = findCart.totalItems - 1
        
                            let data = await CartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true }) //update the cart with total items and totalprice
        
                            return res.status(200).send({ status: true, message: `No such quantity/product exist in cart`, data: data })
                        }
                    }
                }
                let data = await CartModel.findOneAndUpdate({ _id: cartId }, { items: itemsArr, totalPrice: totalAmount }, { new: true })
        
                return res.status(200).send({ status: true, message: `${productId} quantity is been reduced By 1`, data: data })
        
    } catch (err) {
        res.status(500).send({status:false, message:err.message})
    }
}

// ============================================GET CART===============================================

const getCart = async(req, res)=>{
    try {
        const userId = req.params.userId
        if (!(isValid(userId))) { return res.status(400).send({ status: false, message: "userId is required" }) }
    
        if (!isValidObjId.test(userId)) { return res.status(400).send({ status: false, message: "Valid userId is required" }) }
    
        const isUserIdPresent = await UserModel.findOne({ _id: userId })

        if (!isUserIdPresent){ return res.status(400).send({ status: false, Data: "No data found with this userId" })}
     
        const returningCart=await CartModel.find({userId:userId})
        if (!returningCart){ return res.status(400).send({ status: false, Data: "No Items added to cart" })}

        if (returningCart.userId !== req.user) {
          res.status(401).send({ status: false, message: "Unauthorized access! You are not authorized to Get this cart details" });
          return
      }
       

        return res.status(200).send({status:true,message: 'Success',data:returningCart})
    }catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

// ============================================DELETE CART===============================================

const deleteCart = async(req, res)=>{
    try {
        let userId = req.params.userId
        if (!(isValid(userId) || isValidObjId.test(userId))) {
            return res.status(400).send({ status: false, message: "ProductId is invalid" })
        }

        const findProductById = await UserModel.findOne({ _id: userId})

        if (!findProductById) {
            return res.status(404).send({ status: false, message: "No user found" })
        }

        const findCartById = await CartModel.findOne({ userId: userId})

        if (findCartById.userId !== req.user) {
          res.status(401).send({ status: false, message: "Unauthorized access! You are not authorized to Delete product from this cart" });
          return
        }


        if (findCartById.items.length===0) {
            return res.status(400).send({ status: false, message: "Product Already deleted" })
        }

        if (!findCartById) {
            return res.status(404).send({ status: false, message: "No product Available,Already deleted" })
        }

        const deleteProductData = await CartModel.findOneAndUpdate({ _id: findCartById._id },{ $set: { items:[],totalItems:0,totalPrice:0} }, { new: true })

        if (!deleteProductData) {
            return res.status(404).send({ status: false, msg: "Not Found" })
        }

        return res.status(200).send({ status: true, message: "Product deleted successfullly." })


    }catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}


module.exports={addToCart, updateCart, getCart, deleteCart}
