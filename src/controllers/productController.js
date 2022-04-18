const ProductModel = require("../models/productModel");
const aws = require("../aws/aws.js")

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


// ============================================ CREATE PRODUCT ===============================================

const createProduct = async (req, res) => {
  try {
      const data=req.body
      const files = req.files
      if(!Object.keys(data).length>0) return res.status(400).send({status:true, message:"Please Provide product data in body"})
      let { title, description, price, currencyId, currencyFormat} = data

      if (files && files.length > 0) {
        productImageUrl = await aws.uploadFile(files[0])
        data.productImage = productImageUrl;
      }
      else { return res.status(404).send({ message: "No file found" }) }

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

      const isTitlePresent=await ProductModel.findOne({title:title})
      if(isTitlePresent){
        res.status(400).send({status:false, message:"This title is already in use, plz provide anothor title"})
        return
      }

      const productCreated = await ProductModel.create(data)
      res.status(201).send({status:true, message:"Success", data: productCreated })

  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};


// ========================================== GET PRODUCT BY QUERY ============================================

const getProductByQuery = async (req, res) => {
  try {
    let { name, description, price, currencyId, currencyFormat, style, size,priceGreaterThan,priceLessThan, priceSort } = req.query;
    let obj = {};
    if (name != null) obj.name = name;
    if (description != null) obj.description = description;
    if (price != null) obj.price = price;
    if (currencyId != null) obj.currencyId = currencyId;
    if (currencyFormat != null) obj.currencyFormat = currencyFormat;
    if (style != null) obj.style = style;
    if (size != null) obj.size = size;
    if (priceGreaterThan != null) obj.priceGreaterThan = priceGreaterThan;
    if (priceLessThan != null) obj.priceLessThan = priceLessThan;
    if (priceSort != null) obj.priceSort = priceSort;

    obj.isDeleted = false;

    obj['availableSizes']=size

    if(Object.keys(obj).length === 0) return res.status(400).send({status:true, message:"Please Provide Product data in query"})


    if("name" in obj){
    obj['title']={$regex:name}
    if (!isValid(name)) {
      res.status(400).send({ status: false, message: "Product name can't be empty"})
      return
    }
  }
  
  if(("priceGreaterThan" && "priceLessThan") in obj){
    obj['price']={$gte:priceGreaterThan}
    obj['price']={$lte:priceLessThan}
    const productData= await ProductModel.find(obj)
    res.status(200).send({status:true, message:`Product between price ${priceGreaterThan} to ${priceLessThan}`, data:productData})
    return
  }

  if("priceGreaterThan" in obj){
    obj['price']={$gte:priceGreaterThan}
    const productData= await ProductModel.find(obj)
    res.status(200).send({status:true, message:`Product greater than ${priceGreaterThan}`, data:productData})
    return
  }
  if("priceLessThan" in obj){
    obj['price']={$lte:priceLessThan}
    const productData= await ProductModel.find(obj)
    res.status(200).send({status:true, message:`Product less than ${priceLessThan}`, data:productData})
    return
  }



    const productData= await ProductModel.find(obj)

    if(productData.length===0){
      res.status(404).send({status:false, message:"Product Data not Found"})
      return
    }

    if("priceSort" in obj){

    if(priceSort==1){
      const productData= await ProductModel.find(obj).sort({price:1})
      res.status(200).send({status:true, message:"Data Found with Ascending price", data:productData})
      return
    }    
    if(priceSort==-1){
      const productData= await ProductModel.find(obj).sort({price:-1})
      res.status(200).send({status:true, message:"Data Found with Descending price", data:productData})
      return
    }
    if(!(priceSort===1 || priceSort===-1)){
        res.status(400).send({status:false, message:"PriceSort Should be 1=(Ascending) or -1=(Descending)"})
        return
    }
  }

    res.status(200).send({status:true, message:"Data Found", data:productData})

  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};


// ========================================== GET PRODUCT BY PARAMS ===========================================

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


// ============================================ UPDATE  PRODUCT ===============================================

const updateProduct = async (req, res) => {
  try {
    const data=req.body
    const productImage = req.files
    let productId=req.params.productId

    let { title, description, price, currencyId, currencyFormat } = data
    if (!isValidObjId.test(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "please provide valid Product" });
    }

    if (productImage && productImage.length > 0) {
      productImageUrl = await aws.uploadFile(productImage[0])
      data.productImage = productImageUrl;
      }
    // else{
    //   return res.status(404).send({status:false, message:"File not found"})
    // }


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


    const isTitlePresent=await ProductModel.findOne({title:title})
    if(isTitlePresent){
      res.status(400).send({status:false, message:"This title is already present, plz provide anothor title"})
      return
    }

    const isProductIdPresent=await ProductModel.findOne({_id:productId, isDeleted:false})

    if(!isProductIdPresent){
      res.status(404).send({status:false, message:"Product not found with this Product Id"})
      return
    }

    const updatedProduct=await ProductModel.findByIdAndUpdate(productId, data,{new:true})


    res.status(200).send({ status: true, message: "Product updated sucessfully", data:updatedProduct });


  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};


// ============================================ DELETE PRODUCT ===============================================

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
