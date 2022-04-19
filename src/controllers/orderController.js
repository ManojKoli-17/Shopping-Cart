const CartModel = require("../models/cartModel");
const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");
const UserModel = require("../models/userModel");

const isValidObjId=/^[0-9a-fA-F]{24}$/

const isValid = function (value) {
  if (typeof value === "undefined" || typeof value === "null") {
    return false;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return true;
  }
};

const isValidRequestBody = function(object){
  return Object.keys(object).length > 0
  }


const createOrder = async(req, res) => {
    try {
        const userId = req.params.userId;
        const requestBody = req.body;


        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request body. Please provide the the input to proceed."})}

        const { cartId, cancellable, status } = requestBody;


        if (!isValidObjId.test(userId)) { return res.status(400).send({ status: false, message: "Invalid userId in params." })}

        const searchUser = await UserModel.findOne({ _id: userId });
        if (!searchUser) { return res.status(400).send({ status: false, message: `user doesn't exists for ${userId}`})}


        if (!cartId) { return res.status(400).send({ status: false, message: `Cart doesn't exists for ${userId}`})}
        if (!isValidObjId.test(cartId)) { return res.status(400).send({ status: false, message: "Invalid cartId in request body."})}


        const searchCartDetails = await CartModel.findOne({ _id: cartId,userId: userId});
        if (!searchCartDetails) {
            return res.status(400).send({ status: false, message: `Cart doesn't belongs to ${userId}`});
        }

        // Authentication & authorization
        if (searchCartDetails.userId() !== req.userId) {
            res.status(401).send({ status: false, message: `Unauthorized access! You are not authorized to placed this order` });
            return
        }


        if (cancellable) {
            if (typeof cancellable != "boolean") {
                return res.status(400).send({ status: false, message: `Cancellable must be either 'true' or 'false'.`});
            }
        }

        if (status) {
          if(!["pending", "completed", "cancelled"].includes(status)){
            return res.status(400).send({status : false, message : "status should be from [pending, completed, cancelled]"})
          }
        }


        if (!searchCartDetails.items.length) {
            return res.status(202).send({ status: false, message: "Order already placed for this cart. Please add some products in cart to make an order."});
        }

        const reducer = (previousValue, currentValue) =>
            previousValue + currentValue;

        let totalQuantity = searchCartDetails.items
            .map((x) => x.quantity).reduce(reducer);


        const orderDetails = {
            userId: userId,
            items: searchCartDetails.items,
            totalPrice: searchCartDetails.totalPrice,
            totalItems: searchCartDetails.totalItems,
            totalQuantity: totalQuantity,
            cancellable,
            status,
        };
        const savedOrder = await OrderModel.create(orderDetails);

        await CartModel.findOneAndUpdate({ _id: cartId, userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0} });
        return res.status(200).send({ status: true, message: "Order placed.", data: savedOrder });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};


const updateOrder = async(req, res) => {
    try {
        const userId = req.params.userId;
        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request body. Please provide the the input to proceed."});
        }

        const { orderId, status } = requestBody;
        if (!isValidObjId.test(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." });
        }
        const searchUser = await UserModel.findOne({ _id: userId });
        if (!searchUser) {
            return res.status(400).send({ status: false, message: `user doesn't exists for ${userId}`});
        }


        if (!orderId) {
            return res.status(400).send({ status: false, message: `Order doesn't exists for ${orderId}`});
        }

        isOrderBelongsToUser = await OrderModel.findOne({ userId: userId });

                // Authentication & authorization
        // if (isOrderBelongsToUser !== req.userId) {
        //         res.status(401).send({ status: false, message: "Unauthorized access! You are not authorized to update the status of this order" });
        //         return
        // }
        if (!isOrderBelongsToUser) {
            return res.status(400).send({ status: false, message: `Order doesn't belongs to ${userId}`});
        }

        if (!status) {
            return res.status(400).send({ status: true, message: "Mandatory paramaters not provided. Please enter current status of the order."});
        }
        if (status) {
          if(!["pending", "completed", "cancelled"].includes(status)){
            return res.status(400).send({status : false, message : "status should be from [pending, completed, cancelled]"})
          }
        }


        if (isOrderBelongsToUser["cancellable"] == true) {
          if(!["pending", "completed", "cancelled"].includes(status)){
                if (isOrderBelongsToUser['status'] == 'pending') {
                    const updateStatus = await OrderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: status } }, { new: true })
                    return res.status(200).send({ status: true, message: `Successfully updated the order details.`, data: updateStatus })
                }

                if (isOrderBelongsToUser['status'] == 'completed') {
                    return res.status(400).send({ status: false, message: `Unable to update or change the status, because it's already in completed status.` })
                }

                if (isOrderBelongsToUser['status'] == 'cancelled') {
                    return res.status(400).send({ status: false, message: `Unable to update or change the status, because it's already in cancelled status.` })
                }
            }
        }
        else{
        if (isOrderBelongsToUser['status'] == "completed") {
            if (status) {
                return res.status(400).send({ status: true, message: `Cannot update or change the status, because it's already in completed status.` })
            }
        }

        if (isOrderBelongsToUser['status'] == "cancelled") {
            if (status) {
                return res.status(400).send({ status: true, message: `Unable to update status due to Non-cancellation policy.` })
            }
        }

                const updatedOrderDetails = await OrderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: status } }, { new: true })

                return res.status(200).send({ status: true, message: `Successfully updated the order details.`, data: updatedOrderDetails })

            }

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = {createOrder,updateOrder}