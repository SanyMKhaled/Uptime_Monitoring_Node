const { hash, tokenID,parseJson, } = require('../../helpers/utilities')
const lib = require('../../lib/data')

const handler = {}

handler.tokensHandler =(requestProperties,callback)=>{
    const acceptedMethods = ['get','post','put','delete']
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._token[requestProperties.method](requestProperties,callback)
    }
    else {callback(405)}
}

handler._token = {}

handler._token.post = (requestProperties,callback)=>{

    const phone = typeof(requestProperties.body.phone)=== 'string' &&
                    requestProperties.body.phone.trim().length === 11 
                    ? requestProperties.body.phone 
                    : false

    const password = typeof(requestProperties.body.password)==='string' && 
                    requestProperties.body.password.length != null 
                    ? requestProperties.body.password 
                    : false ;
    if(phone && password){ 
        lib.read('users',phone,(err,userData)=>{
            const uData = {...parseJson(userData)}
            let hashedPass = hash(password)
            if(hashedPass===uData.password){
                let tokenId = tokenID(20);
                const expires = Date.now() + 60*60*1000
                const tokenObj = {
                    phone,
                    'id':tokenId,
                    expires
                }
                lib.write('tokens',tokenId,tokenObj,(err)=>{
                    if(!err){
                        callback(200,tokenObj)
                    }
                    else callback(500,{
                        Message: 'Server Error'
                    })
                })
            }
            else callback(400,{
                Error: 'No User Found'
            })
        })

    } else callback(400,{
        Error: 'Request Error'
    })               
}
handler._token.get = (requestProperties,callback)=>{ 



    const tokenId = typeof(requestProperties.queryStringPath.tokenId)=== 'string' &&
                    requestProperties.queryStringPath.tokenId.length === 20
                    ? requestProperties.queryStringPath.tokenId
                    : false

    if(tokenId){
        lib.read('tokens',tokenId,(err,tokenInfo)=>{
            const token = {...parseJson(tokenInfo)}
            if(!err && token){
                callback(200,token)
            }
            else callback(404,{
                error: 'Error Fetching Token Info'
            })
        })
    }   else callback(404,{
        error: 'Invalid Token'
    })             
}             

handler._token.put = (requestProperties,callback)=>{
    const tokenId = typeof(requestProperties.body.tokenId)=== 'string' &&
    requestProperties.body.tokenId.length === 20
    ? requestProperties.body.tokenId
    : false

    const extended = typeof(requestProperties.body.extended)==='boolean' && requestProperties.body.extended === true?true:false

    if(tokenID,extended){
        lib.read('tokens',tokenId,(err,tokenData)=>{
            const tData = {...parseJson(tokenData)} 
            if(tData.expires>Date.now()){
                tData.expires = Date.now()+60*60*1000
                lib.update('tokens',tokenId,tData,(err)=>{
                    if(!err){
                        callback(200,{
                            Message: 'Token Updated'
                        })
                    } else callback(500,{
                        Error: 'Server Error'
                    })
                })
            }else {callback(400,{
                Error: 'Token Already Expires'
            })}
        })
    }else(callback(400,{
        Error: 'Request Error'
    }))
}
handler._token.delete = (requestProperties,callback)=>{
    const tokenId = typeof(requestProperties.queryStringPath.tokenId)=== 'string' &&
    requestProperties.queryStringPath.tokenId.length ===  20
    ? requestProperties.queryStringPath.tokenId 
    : false

    if(tokenId){
        lib.read('tokens',tokenId,(err,token)=>{
            if(!err && token){
                lib.delete('tokens',tokenId,(err)=>{
                    if(!err){
                        callback(200,{
                            Message: 'Token Deleted Successfully'
                        })
                    } else callback(500,{
                        Error: 'Could not Delete Token'
                    })
                })
            }else callback(500,{
                Error: 'Token Not Found'
            })
        })
    } else callback(500,{
        Error: 'Request Error'
    })
}

handler._token.verifyToken = (tId,phone,callback)=>{
    lib.read('tokens',tId,(err,tokenData)=>{
        if(!err && tokenData){
            if(parseJson(tokenData).phone===phone && parseJson(tokenData).expires>Date.now()){
                callback(true)
            } else(callback(false))
        }else callback(false)
    })
}

module.exports = handler