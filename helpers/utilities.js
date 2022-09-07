const enviornment = require('./enviornment')
const crypto = require('crypto')
const utilities = {}

utilities.parseJson = (jsonString)=>{
    let output = {}
    try{
        output = JSON.parse(jsonString)
    }catch{
        output = {}
    }
    return output
}
utilities.tokenID = (strlen)=>{
    let output = '';
    const charStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
    for(let i=0;i<strlen;i++){
        output += charStr.charAt(Math.floor(Math.random()*charStr.length))
    }
    return output
}

utilities.hash = (pass)=>{
    if(typeof pass==='string' && pass.length > 0){
        const hash = crypto.createHmac('sha256',enviornment.secretKey)
        .update(pass)
        .digest('hex')
        return hash
    }
    return false
}



module.exports = utilities;

