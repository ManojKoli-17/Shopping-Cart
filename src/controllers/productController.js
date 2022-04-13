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

const isValid2 = function (value) {
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const createProduct = async (req, res) => {
  try {
      data=req.body
      if(!Object.keys(data).length>0) return res.status(400).send({status:true, message:"Please Provide product data in body"})
      let { title, description, price, currencyId, currencyFormat, productImage } = data

      if (!isValid(title)) {
        res.status(400).send({ status: false, message: 'please provide title' })
        return
      }
      if (!isValid(description)) {
        res.status(400).send({ status: false, message: 'please provide description' })
        return
      }
      if (!isValid(price)) {
        res.status(400).send({ status: false, message: 'please provide price' })
        return
      }
      if (!isValid(currencyId)) {
        res.status(400).send({ status: false, message: 'please provide currencyId' })
        return
      }
      if (!isValid(currencyFormat)) {
        res.status(400).send({ status: false, message: 'please provide currencyFormat' })
        return
      }
      if (!isValid(productImage)) {
        res.status(400).send({ status: false, message: 'please provide productImage' })
        return
      }

      const isTitlePresent=await ProductModel.findOne({title:title})
      if(isTitlePresent){
        res.status(400).send({status:false, message:"This title is already in use, plz provide anothor title"})
      }

      const productCreated = await ProductModel.create(data)
      res.status(201).send({status:true, message:"Success", data: productCreated })

  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};


const getProductByQuery = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

const getProductByParams = async (req, res) => {
  try {
    let productId=req.params.productId
    if (!isValidObjId.test(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "please provide valid Product" });
    }

    const isProductIdPresent=await ProductModel.findOne({_id:productId, isDeleted:false})

    if(!isProductIdPresent){
      res.status(404).send({status:false, message:"Product not found with this Product Id"})
      return
    }

    res.status(200).send({status:true, message:"Success", data:isProductIdPresent })

  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};


const updateProduct = async (req, res) => {
  try {
    const data=req.body
    let productId=req.params.productId

    let { title, description, price, currencyId, currencyFormat, productImage } = data
    if (!isValidObjId.test(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "please provide valid Product" });
    }

    if (!isValid2(title)) {
      res.status(400).send({ status: false, message: "Title can't be empty, please provide title" })
      return
    }
    if (!isValid2(description)) {
      res.status(400).send({ status: false, message: "Description can't be empty, please provide escription" })
      return
    }
    if (!isValid2(price)) {
      res.status(400).send({ status: false, message: "Price can't be empty, please provide price" })
      return
    }
    if (!isValid2(currencyId)) {
      res.status(400).send({ status: false, message: "CurrencyId can't be empty, please provide currencyId" })
      return
    }
    if (!isValid2(currencyFormat)) {
      res.status(400).send({ status: false, message: "CurrencyFormat can't be empty, please provide currencyFormat" })
      return
    }
    if (!isValid2(productImage)) {
      res.status(400).send({ status: false, message: "ProductImage can't be empty, please provide productImage" })
      return
    }


    const isTitlePresent=await ProductModel.findOne({title:title})
    if(isTitlePresent){
      res.status(400).send({status:false, message:"This title is already present, plz provide anothor title"})
    }

    const isProductIdPresent=await ProductModel.findOne({_id:productId, isDeleted:false})

    if(!isProductIdPresent){
      res.status(404).send({status:false, message:"Product not found with this Product Id"})
      return
    }


  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};
const deleteProduct = async (req, res) => {
  try {
    let productId=req.params.productId
    if (!isValidObjId.test(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "please provide valid Product" });
    }

    const isProductIdPresent=await ProductModel.findOne({_id:productId})

    if(!isProductIdPresent){
      res.status(404).send({status:false, message:"Product not found with this Product Id"})
      return
    }
    if(isProductIdPresent.isDeleted===true){
      res.status(404).send({status:false, message:"This Product is already deleted"})
      return
    }
    const productDeleted=await ProductModel.findByIdAndUpdate({_id:productId}, { isDeleted:true}, {new:true})
    res.status(200).send({status:true, message:"Product deleted Succefully", data:productDeleted})
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  createProduct,
  getProductByQuery,
  getProductByParams,
  updateProduct,
  deleteProduct,
};
