const handler = {}

handler.sampleHandler =(requestProperties,callback)=>{
    console.log(requestProperties)
    callback(200,{
        message: 'From Sample Handler'
    })
}

module.exports = handler