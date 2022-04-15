const OrderModel = require("../models/orderModel");

const isValidObjId=/^[0-9a-fA-F]{24}$/

const isValid = function (value) {
  if (typeof value === "undefined" || typeof value === "null") {
    return false;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return true;
  }
};

const isValid2 = function (value) {
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};




const createOrder = async(req, res)=>{
    try {

    } catch (err) {
        res.status(500).send({status:false, message:err.message})
    }
}

const updateOrder = async(req, res)=>{
    try {
        const data=req.body

    } catch (err) {
        res.status(500).send({status:false, message:err.message})
    }
}


module.exports={createOrder, updateOrder}