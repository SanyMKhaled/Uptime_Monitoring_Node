//Dependencies
const url = require('url')
const {StringDecoder} = require('string_decoder')
const route = require('../routes')
const {notFoundHandler} = require('../handlers/routehandlers/notFoundHandler')
const {parseJson} = require('./utilities')

// Scafolding
const handler = {}

handler.handleReqRes =(req,res)=>{
        //Request Handler
        const parsedUrl = url.parse(req.url,true)
        const path = parsedUrl.pathname
        const trimmedPath = path.replace(/^\/|\/+$/g,'')
        const method = req.method.toLowerCase()
        const queryStringPath =parsedUrl.query
        const headers = req.headers;
        const requestProperties = {
            parsedUrl,
            path,
            trimmedPath,
            method,
            queryStringPath,
            headers
        }

        const chosenHandler = route[trimmedPath]? route[trimmedPath] : notFoundHandler
        const decoder = new StringDecoder('utf-8')
        realData = ''
    
        req.on('data',(buffer)=>{
            realData += decoder.write(buffer)
        })
    
        req.on('end',()=>{
            realData += decoder.end()
            requestProperties.body = parseJson(realData)

            chosenHandler(requestProperties,(statuscode,payload)=>{
            statuscode = typeof (statuscode)==='number'? statuscode : 500
            payload = typeof (payload) === 'object'? payload:{}
            const payloadString = JSON.stringify(payload)
            res.setHeader('Content-Type','application/json')
            res.writeHead(statuscode)
            res.end(payloadString)
        })
 })

}

module.exports = handler