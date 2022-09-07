const handler = {}

handler.notFoundHandler =(requestProperties,callback)=>{
    callback(404,{
        message: '404 ! Not Found'
    })
}

module.exports = handler