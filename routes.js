//Dependencies 
const { sampleHandler } = require('./handlers/routehandlers/samplehandler')
const {usersHandler}= require('./handlers/routehandlers/usersHandler')
const {tokensHandler} = require('./handlers/routehandlers/tokenHandler')
const {checksHandler} = require('./handlers/routehandlers/checksHandler')

const routes = {
    sample : sampleHandler,
    user : usersHandler,
    token: tokensHandler,
    check: checksHandler
}

module.exports = routes;