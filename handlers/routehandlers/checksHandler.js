const { hash,parseJson,tokenID } = require('../../helpers/utilities')
const lib = require('../../lib/data')
const tokenHandler = require('./tokenHandler')
const {checkLength} = require('../../helpers/enviornment')

const handler = {}

handler.checksHandler =(requestProperties,callback)=>{
    const acceptedMethods = ['get','post','put','delete']
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._checks[requestProperties.method](requestProperties,callback)
    }
    else {callback(405)}
}

handler._checks = {}

handler._checks.post = (requestProperties,callback)=>{
    const acceptedMethods = ['POST','GET','DELETE','PUT','post','get','delete','put']
    let protocol = typeof(requestProperties.body.protocol)==="string" && ['http','https'].indexOf(requestProperties.body.protocol)> -1?requestProperties.body.protocol:false;
    let url = typeof(requestProperties.body.url)==='string' && requestProperties.body.url.trim().length > 0? requestProperties.body.url:false
    const method = typeof(requestProperties.body.method)==='string' && acceptedMethods.indexOf(requestProperties.body.method)> -1? requestProperties.body.method:false;
    const successCode = typeof(requestProperties.body.successCode)==='object' && requestProperties.body.successCode instanceof Array ? requestProperties.body.successCode:false
    const timeout = typeof(requestProperties.body.timeout)==='number' && requestProperties.body.timeout %1===0 && requestProperties.body.timeout >=1 && requestProperties.body.timeout <= 5;


    if(protocol && url && method && successCode && timeout){
        
        let token = typeof(requestProperties.headers.token)==='string'? requestProperties.headers.token : false

        if(token){
            lib.read('tokens',token,(err,tokenData)=>{
                if(!err && tokenData){
                    let userPhone = parseJson(tokenData).phone
    
                    lib.read('users',userPhone,(err,userData)=>{
                        if(!err && userData){
                            let phone = parseJson(userData).phone
                            tokenHandler._token.verifyToken(token,phone,(isValid)=>{
                                if(isValid){
                                    let userObj = parseJson(userData)
                                    const userChecks = typeof(userObj.checks)==='object' && userObj.checks instanceof Array ? userObj.checks:[]
                                    if(userChecks.length < checkLength){
                                        const checkId = tokenID(20) // Random String Generator Function
                                        const checkObj = {
                                            id: checkId,
                                            userPhone: phone,
                                            protocol,
                                            url,
                                            method,
                                            successCode,
                                            timeout
                                        }
                                        lib.write('checks',checkId,checkObj,(err)=>{
                                            if(!err){
                                                userObj.checks = userChecks
                                                userObj.checks.push(checkId)
    
                                                lib.update('users',phone,userObj,(err)=>{
                                                    if(!err){
                                                        callback(200, checkObj)
                                                    } else callback(500,{
                                                        message: 'Server Error'
                                                    })
                                                })
                                            }else callback(401,{
                                                message:'Writing Checks Failed'
                                            })
                                        })
                                    }
                                }else callback(400,{
                                    message:'Token is not Valid'
                                })
                            })
                        }
                        else callback(400,{
                            Message: 'No User Found'
                        })
                    })
                } else callback(400,{
                    message: 'Authentication Error'
                })
            })
        } else callback(400,{
            messages: 'Authentication Error'
        })



    }else callback(400,{
        Error:'Checks Handler, Request Error'
    })
}
handler._checks.get = (requestProperties,callback)=>{ 
    
    const checkId = typeof(requestProperties.queryStringPath.id)=== 'string' &&
                    requestProperties.queryStringPath.id.length === 20
                    ? requestProperties.queryStringPath.id
                    : false

     if(checkId){
        lib.read('checks',checkId,(err,checkData)=>{
            if(!err && checkData){
                let token = typeof(requestProperties.headers.token)==='string'? requestProperties.headers.token : false
                tokenHandler._token.verifyToken(token,parseJson(checkData).userPhone,(isvalid)=>{
                    if(isvalid){
                        callback(200,parseJson(checkData) )
                    } else callback(400,{
                        messsge: 'check ID Authentication Error'
                    })
                })

            } else callback(500,{
                Message: 'Server Error'
            })
        })
     }    else callback(400,{
        Error:'Check ID Invalid'
     })           
}
handler._checks.put = (requestProperties,callback)=>{
    const checkId = typeof(requestProperties.body.id)=== 'string' &&
    requestProperties.body.id.length === 20
    ? requestProperties.body.id
    : false

    let protocol = typeof(requestProperties.body.protocol)==="string" && ['http','https'].indexOf(requestProperties.body.protocol)> -1?requestProperties.body.protocol:false;
    let url = typeof(requestProperties.body.url)==='string' && requestProperties.body.url.trim().length > 0? requestProperties.body.url:false
    const method = typeof(requestProperties.body.method)==='string' && acceptedMethods.indexOf(requestProperties.body.method)> -1? requestProperties.body.method:false;
    const successCode = typeof(requestProperties.body.successCode)==='object' && requestProperties.body.successCode instanceof Array ? requestProperties.body.successCode:false
    const timeout = typeof(requestProperties.body.timeout)==='number' && requestProperties.body.timeout %1===0 && requestProperties.body.timeout >=1 && requestProperties.body.timeout <= 5;

    if(checkId){
        if(protocol || url || method || successCode || timeout){
            lib.read('checks',checkId,(err,checkData)=>{
                if(!err && checkData){
                    let checkObj = parseJson(checkData)                
                    let token = typeof(requestProperties.headers.token)==='string'? requestProperties.headers.token : false

                    tokenHandler._token.verifyToken(token,checkObj.userPhone,(isvalid)=>{
                        if(isvalid){
                            if(protocol){
                                checkObj.protocol = protocol
                            }
                            if(url){
                                checkObj.url = url
                            }
                            if(method){
                                checkObj.method = method
                            }
                            if(successCode){
                                checkObj.successCode = successCode
                            }
                            if(timeout){
                                checkObj.timeout = timeout
                            }

                            lib.update('checks',checkId,checkObj,(err)=>{
                                if(!err){
                                    callback(200,checkObj)
                                } else callback(500,{
                                    message: 'There is a serverside error'
                                })
                            })
                        } else callback(401,{
                            message:'Authentication Error'
                        })
                    })

                }else callback(400,{
                    message: 'No Check List'
                })
            })
        }else callback(400,{
            message: 'Give Atleast One field to update'
        })
    } else callback(400,{
        message: 'Invalid Check ID'
    })
    
    


}
handler._checks.delete = (requestProperties,callback)=>{
    const checkId = typeof(requestProperties.queryStringPath.id)=== 'string' &&
                    requestProperties.queryStringPath.id.length === 20
                    ? requestProperties.queryStringPath.id
                    : false

     if(checkId){
        lib.read('checks',checkId,(err,checkData)=>{
            if(!err && checkData){
                let token = typeof(requestProperties.headers.token)==='string'? requestProperties.headers.token : false
                tokenHandler._token.verifyToken(token,parseJson(checkData).userPhone,(isvalid)=>{
                    if(isvalid){
                        lib.delete('checks',checkId,(err)=>{
                            if(!err){
                                lib.read('users',parseJson(checkData).userPhone,(err,userData)=>{
                                    if(!err && userData){
                                        const userObj=parseJson(userData)
                                        const userChecks = typeof(userObj.chceks)==='object' && userObj.checks instanceof Array ? userObj.chceks : []
                                        let checkPostion = userObj.chceks.indexOf(checkId)
                                        if(checkPostion > -1){
                                            userChecks.splice(checkPostion,1)
                                            userObj.chceks = userChecks
                                            lib.update('users',userObj.phone,userObj,(err)=>{
                                                if(!err){
                                                    callback(200,userObj)
                                                } else callback(400,{
                                                    messsge: 'Error Updating'
                                                })
                                            })
                                        }
                                    } else callback(401,{
                                        messsge: 'User Not Found'
                                    })
                                })
                            } else callback(500,{
                                messsge: 'Server Error'
                            })
                        })
                    } else callback(400,{
                        messsge: 'check ID Authentication Error'
                    })
                })

            } else callback(500,{
                Message: 'Server Error'
            })
        })
     }    else callback(400,{
        Error:'Check ID Invalid'
     })           
}

module.exports = handler