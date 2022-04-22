const mongoose = require('mongoose')
//const ObjectId = mongoose.Types.ObjectId

const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
};

const isValid1 = function (value) {
    if (typeof value == "undefined" || value == null) return false
    if (value.trim().length == 0) return false
    return true
}
const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0;
} 

const validString = function(value) {
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidNumber = function(value) {
    if (typeof value === Number && value.trim().length === 0) return false
    return true;
}

const validInstallment = function isInteger(value) {
    return value % 1 == 0;
    
}

module.exports.isValid = isValid
module.exports.isValid1 = isValid1
module.exports.isValidRequestBody = isValidRequestBody
module.exports.isValidObjectId = isValidObjectId
module.exports.validString = validString
module.exports.isValidNumber = isValidNumber
module.exports.validInstallment = validInstallment
