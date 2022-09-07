const enviornments = {}

enviornments.staging = {
    port : 3000,
    name: 'staging',
    secretKey : 'qwerty',
    checkLength: 5
}

enviornments.production = {
    port : 5000,
    name: 'production',
    secretKey : 'asdfgh',
    checkLength: 5
}

const currentEnviornment = typeof process.env.NODE_ENV_PORT === 'string'? process.env.NODE_ENV_PORT : 'staging'

const toExportEnviornment = typeof(enviornments[currentEnviornment]) === 'object'? enviornments[currentEnviornment] : enviornments.staging

module.exports = toExportEnviornment;

