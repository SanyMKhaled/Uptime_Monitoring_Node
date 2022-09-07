const { hash,parseJson } = require('../../helpers/utilities')
const lib = require('../../lib/data')
const tokenHandler = require('./tokenHandler')

const handler = {}

handler.usersHandler =(requestProperties,callback)=>{
    const acceptedMethods = ['get','post','put','delete']
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._users[requestProperties.method](requestProperties,callback)
    }
    else {callback(405)}
}
handler._users = {}

handler._users.post = (requestProperties,callback)=>{
    const firstName = typeof(requestProperties.body.firstName)==='string' && 
                    requestProperties.body.firstName.length > 0 
                    ? requestProperties.body.firstName 
                    :  false;
    
    const lastName = typeof(requestProperties.body.lastName)==='string' && 
                    requestProperties.body.lastName.length > 0 
                    ? requestProperties.body.lastName 
                    :  false;

    const phone = typeof(requestProperties.body.phone)=== 'string' &&
                    requestProperties.body.phone.trim().length === 11 
                    ? requestProperties.body.phone 
                    : false

    const password = typeof(requestProperties.body.password)==='string' && 
                    requestProperties.body.password.length != null 
                    ? requestProperties.body.password 
                    : false ;
    const tos = typeof(requestProperties.body.tos)==='boolean'
                        ? requestProperties.body.tos
                        : false
                        
    if(firstName && lastName && phone && password && tos){
        
        lib.read('users',phone,(err)=>{
            if(err){
                const sData = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tos,
                }
                lib.write('users',phone,sData,(err)=>{
                    if(!err){
                        callback(200,{
                            message: 'User Created Successfully'
                        })  
                    }
                    else callback(500,{
                        message: 'Error Creating User'
                    })
                })
            }
            else{
                callback(500,{
                    message: 'User Already Exists'
                })
            }
        })
        
    }
    else {
        callback(400,{
            message : 'Request Problem'
        })
    }
}
handler._users.get = (requestProperties,callback)=>{ 
    const phone = typeof(requestProperties.queryStringPath.phone)=== 'string' &&
                    requestProperties.queryStringPath.phone.length === 11 
                    ? requestProperties.queryStringPath.phone 
                    : false

    if(phone){
        let token = typeof(requestProperties.headers.token) ==='string'?requestProperties.headers.token:false

        tokenHandler._token.verifyToken(token,phone,(tokenID)=>{
            console.log(token,phone,tokenID)
            if(tokenID){
                lib.read('users',phone,(err,userInfo)=>{
                    const user = {...parseJson(userInfo)}
                    if(!err && user){
                        delete user.password;
                        callback(200,user)
                    }
                    else callback(404,{
                        error: 'Error Fetching User Info'
                    })
                })
    
            }else callback(403,{
                Message: 'Authentication Failed'
            })
        })
    
        
    }   else callback(404,{
        error: 'Requested User Not Found'
    })             
}
handler._users.put = (requestProperties,callback)=>{
    const phone = typeof(requestProperties.body.phone)=== 'string' &&
    requestProperties.body.phone.length === 11 
    ? requestProperties.body.phone 
    : false

    const lastName = typeof(requestProperties.body.lastName)==='string' && 
    requestProperties.body.lastName.length > 0 
    ? requestProperties.body.lastName 
    :  false;


    const password = typeof(requestProperties.body.password)==='string' && 
    requestProperties.body.password.length != null 
    ? requestProperties.body.password 
    : false ;

    const firstName = typeof(requestProperties.body.firstName)==='string' && 
                    requestProperties.body.firstName.length > 0 
                    ? requestProperties.body.firstName 
                    :  false;


    if(phone){
     let token = typeof(requestProperties.headers.token) ==='string'?requestProperties.headers.token:false
        tokenHandler._token.verifyToken(token,phone,(tokenID)=>{
            console.log(token,phone,tokenID)
            if(tokenID){
                if(firstName || lastName || password){
                    lib.read('users',phone,(err,user)=>{
                        const Userdata = {...parseJson(user)}
                        if(!err && Userdata){
                            if(firstName){
                                Userdata.firstName = firstName
                            }
                            if(lastName){
                                Userdata.lastName = lastName
                            }
                            if(password){
                                Userdata.password = hash(password)
                            }
                            lib.update('users',phone,Userdata,(err)=>{
                                if(!err){
                                    callback(200,{
                                        message:'Data Updated Succesfully'
                                    })
                                }else callback(500,{
                                    Error: 'Could Not Update data '
                                })
                            })
                        } else callback(500,{
                            Error : 'Server Error'
                        })
                    })
                }
                else callback(200,{
                    Message: 'Nothing to Update'
                })
               
    
            }else callback(403,{
                Message: 'Authentication Failed'
            })
        })  
    }else callback(500,{
        Error: 'No Entry For this Phone Number'
    })
}
handler._users.delete = (requestProperties,callback)=>{
    const phone = typeof(requestProperties.queryStringPath.phone)=== 'string' &&
    requestProperties.queryStringPath.phone.length === 11 
    ? requestProperties.queryStringPath.phone 
    : false

    if(phone){
        let token = typeof(requestProperties.headers.token) ==='string'?requestProperties.headers.token:false

        tokenHandler._token.verifyToken(token,phone,(tokenID)=>{
            console.log(token,phone,tokenID)
            if(tokenID){
                lib.read('users',phone,(err,user)=>{
                    if(!err && user){
                        lib.delete('users',phone,(err)=>{
                            if(!err){
                                callback(200,{
                                    Message: 'User Deleted Successfully'
                                })
                            } else callback(500,{
                                Error: 'Could not Delete User'
                            })
                        })
                    }else callback(500,{
                        Error: 'User Not Found'
                    })
                })
    
            }else callback(403,{
                Message: 'Authentication Failed'
            })
        })
        
    } else callback(500,{
        Error: 'Request Error'
    })
}

module.exports = handler