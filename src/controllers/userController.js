const UserModel = require("../models/userModel")
const bcrypt = require('bcrypt')
const aws = require("../aws/aws.js")
const jwt = require('jsonwebtoken')


const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}
const isValid2 = function(value) {
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidPhoneNo=/^\+?([6-9]{1})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{5})$/
const isValidPassword=/^[a-zA-Z0-9!@#$%^&*]{8,15}$/
const isValidEmail=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
const isValidPinCode=/^[1-9]{1}[0-9]{2}\\s{0, 1}[0-9]{3}$/


// ============================================CREATE USER===============================================

const createUser = async (req, res) => {
    try {
        const data= req.body
        
        const files = req.files
        if(Object.keys(data).length === 0) return res.status(400).send({status:true, message:"Please Provide User data in body"})
        let { fname, lname, email, phone, password, address } = data


        if (files && files.length > 0) {
          profileImageUrl = await aws.uploadFile(files[0])
          data.profileImage = profileImage;
        }
        else { return res.status(404).send({ message: "No file found" }) }

        if (!isValid(fname)) {
            res.status(400).send({ status: false, message: 'please provide first name' })
            return
          }
        if (!isValid(lname)) {
            res.status(400).send({ status: false, message: 'please provide last name' })
            return
          }
        if (!isValid(email)) {
            res.status(400).send({ status: false, message: 'please provide Email ID' })
            return
          }
        if (!isValid(phone)) {
            res.status(400).send({ status: false, message: 'please provide Mobile No.' })
            return
          }
        if (!isValid(password)) {
            res.status(400).send({ status: false, message: 'please provide password' })
            return
          }

        if(!address){
          res.status(400).send({status:true, message:"Plz provide address"})
          return
        }
        // address = JSON.parse(address)
        if (Object.keys(address).length === 0) {
             return res.status(400).send({ status: false, message: "Address is required" });
        }

        let { shipping, billing } = address
        if (shipping) {
          let { street, city, pincode } = shipping
          if (!isValid(street)) {
            res.status(400).send({ status: false, message: 'please provide shipping Street name' })
            return
          }
          if (!isValid(city)) {
            res.status(400).send({ status: false, message: 'please provide shipping City name' })
            return
          }
          if (!(pincode)) {
            res.status(400).send({ status: false, message: 'please provide shipping pincode' })
            return
          } 
        // if (!(isValidPinCode.test(pincode))) {
        //   res.status(400).send({ status: false, message: 'please provide valid shipping Pincode.' })
        //   return
        // }
        }
        else {
          return res.status(400).send({ status: false, message: "Invalid request parameters, Shipping address cannot be empty" })
        }
        if (billing) {
          let { street, city, pincode } = billing
          if (!isValid(street)) {
            res.status(400).send({ status: false, message: 'please provide billing Street name' })
            return
          }
          if (!isValid(city)) {
            res.status(400).send({ status: false, message: 'please provide billing City name' })
            return
          }
          if (!(pincode)) {
            res.status(400).send({ status: false, message: 'please provide billing pincode' })
            return
          }
          // if (!(isValidPinCode.test(pincode))) {
          //   res.status(400).send({ status: false, message: 'please provide valid billing Pincode.' })
          //   return
          // }
        }
        else {
          return res.status(400).send({ status: false, message: "Invalid request parameters, billing address cannot be empty" })
        }

        if (!(isValidEmail.test(email))) {
            res.status(400).send({ status: false, message: 'please provide valid Email ID' })
            return
          }
        if (!(isValidPassword.test(password))) {
            res.status(400).send({ status: false, message: 'please provide valid password(minLength=8 , maxLength=15)' })
            return
          }
        if (!(isValidPhoneNo.test(phone))) {
            res.status(400).send({ status: false, message: 'please provide valid Mobile no.' })
            return
          }
        const isPhonePresent = await UserModel.findOne({phone:phone})
        if (isPhonePresent) {
            res.status(400).send({ status: false, message: "This mobile is number already in use,please provide another mobile number" })
            return
          }
        const isEmailPresent = await UserModel.findOne({email:email})
        if (isEmailPresent) {
            res.status(400).send({ status: false, message: "This  is email already in use,please provide another email" })
            return
          }
        const salt = bcrypt.genSaltSync(10);
        const encryptedPass= await bcrypt.hash(password, salt);
 

        const finalData = {
          "fname": fname,
          "lname": lname,
          "email": email,
          "phone": phone,
          "password": encryptedPass,
          "address": address,
          "profileImage": profileImage,
      }

        const createdUser = await UserModel.create(finalData)
        res.status(201).send({status:true, message:"User created successfully", data: createdUser })


    } catch (err) {
        res.status(500).send({status:false, message:err.message})
    }
}

// ============================================LOGIN USER===============================================
const login= async(req,res)=>{
    try {
       const data=req.body

        if(!Object.keys(data).length>0) return res.status(400).send({status:true, message:"Please Provide email and password"})

        const isEmailPresent= await UserModel.findOne({email:data.email})
        if(!isEmailPresent){
            res.status(400).send({status: false, message:"Email Id not exist"})
            return
        }
        if (!isValid(data.email)) {
            res.status(400).send({ status: false, message: 'please provide Email ID' })
            return
          }
        if (!isValid(data.password)) {
            res.status(400).send({ status: false, message: 'please provide password' })
            return
          }
        if (!(isValidEmail.test(data.email))) {
            res.status(400).send({ status: false, message: 'please provide valid Email ID' })
            return
          }
        if (!(isValidPassword.test(data.password))) {
            res.status(400).send({ status: false, message: 'please provide valid password(minLength=8 , maxLength=15)' })
            return
          }

        bcrypt.compare(data.password, isEmailPresent.password, function (err, result) {
            if (result) {
                console.log("Password matched")
                let token = jwt.sign(
                    {
                      userId: isEmailPresent._id.toString(),
                      
                    },
                    "products-management",
                    {expiresIn:"59m"})

                    const userData={
                        userId:isEmailPresent._id,
                        token:token                        
                    }
                    
                   res.status(201).send({ status: true, message: "User login successfull", data: userData});
            }
            else {
                res.status(401).send({status:false, message:"Plz provide correct password"});
                return;
            }
        });

    } catch (err) {
        res.status(500).send({status:false.valueOf, message:err.message})
    }
}

// ============================================GET USER===============================================
const getUser= async(req, res)=>{
    try {
        let userId=req.params.userId

        if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
            return res
              .status(400)
              .send({ status: false, message: "please provide valid UserId" });
          }

        const isUserIdPresent= await UserModel.findById({_id:userId})
        if(!isUserIdPresent){
            res.status(404).send({status:false, message:"User not found with UserId"})
        }

        // if(req.user!=isUserIdPresent._id){
        //   res.status(401).send({status:false, message:"You are not authorized to update"})
        // }

        res.status(200).send({status:true, message:"User profile details", data:isUserIdPresent})
    } catch (err) {
        res.status(500).send({status:false, message:err.message})
    }
}

// ============================================UPDATE USER===============================================
const updateUser= async(req, res)=>{
    try {
        let data=req.body
        const profileImage = req.files
        let userId=req.params.userId
        let { fname, lname, email, phone, password, address } = data

        if(!profileImage && !Object.keys(data).length>0) return res.status(400).send({status:false, message:"Please Provide Some data to update"})

        if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
            return res
              .status(400)
              .send({ status: false, message: "please provide valid UserId" });
          }


          if(profileImage){
            if (profileImage && profileImage.length > 0) {
                profileImageUrl = await aws.uploadFile(profileImage[0])
                data.profileImage = profileImageUrl;
              }
            }


        if (!isValid2(fname)) {
            res.status(400).send({ status: false, message: "First name can't be empty" })
            return
          }
        if (!isValid2(lname)) {
            res.status(400).send({ status: false, message: "last name can't be empty" })
            return
          }
        if (!isValid2(email)) {
            res.status(400).send({ status: false, message: "Email Id can't be empty" })
            return
          }
        if (!isValid2(phone)) {
            res.status(400).send({ status: false, message: "Mobile No. can't be empty" })
            return
          }
        if (!isValid2(password)) {
            res.status(400).send({ status: false, message: "Password can't be empty" })
            return
          }

        if (address && Object.keys(address).length === 0) {
            return res.status(400).send({ status: false, message: "Address can't be empty" });
          }

          if(typeof address!='undefined'){
          let { shipping, billing } = address

          if (shipping) {
            let { street, city, pincode } = shipping
            if (!isValid2(street)) {
              res.status(400).send({ status: false, message: "Shipping Street name can't be empty" })
              return
            }
            if (!isValid2(city)) {
              res.status(400).send({ status: false, message: "Shipping City name can't be empty" })
              return
            }
            if (!isValid2(pincode)) {
              res.status(400).send({ status: false, message: "Shipping pincode can't be empty" })
              return
            } 
          }

          if (billing) {
            let { street, city, pincode } = billing
            if (!isValid2(street)) {
              res.status(400).send({ status: false, message: "billing Street name can't be empty" })
              return
            }
            if (!isValid2(city)) {
              res.status(400).send({ status: false, message: "billing City name can't be empty" })
              return
            }
            if (!isValid2(pincode)) {
              res.status(400).send({ status: false, message: "billing Pincode can't be empty" })
              return
            } 
          }
        }
        

        if (data.email && !(isValidEmail.test(email))) {
            res.status(400).send({ status: false, message: 'please provide valid Email ID' })
            return
          }
        if (data.password && !(isValidPassword.test(password))) {
            res.status(400).send({ status: false, message: 'please provide valid password(minLength=8 , maxLength=15)' })
            return
          }
        if (data.phone && !(isValidPhoneNo.test(phone))) {
            res.status(400).send({ status: false, message: 'please provide valid Mobile no.' })
            return
          }
        if(password){
            const salt = bcrypt.genSaltSync(10);
            const encryptedPass= await bcrypt.hash(password, salt);
      
            password=encryptedPass
        }

        const isUserIdPresent=await UserModel.findOne({_id:userId})
        if(!isUserIdPresent){
          res.status(404).send({status:false, message:"User not found with this userId"})
        }

        const isEmailPresent= await UserModel.findOne({email:email})
        if(isEmailPresent){
            res.status(400).send({status:false, message:"This email is already present you can't upadate it"})
        }
        const isPhonePresent= await UserModel.findOne({phone:phone})
        if(isPhonePresent){
            res.status(400).send({status:false, message:"This Mobile No. is already present you can't upadate it"})
        }

        if(req.user!=isUserIdPresent._id){
          res.status(401).send({status:false, message:"You are not authorized to update"})
          return
        }

        let userData= await UserModel.findByIdAndUpdate(userId, data,{new:true})
        res.status(200).send({ status: true, message:"User profile updated", data: userData });


    } catch (err) {
       res.status(500).send({status:false, message:err.message}) 
    }
}

module.exports = {createUser, login, getUser, updateUser}
