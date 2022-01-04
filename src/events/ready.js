const {version} = require('./../../config/config.json');
module.exports = function (client) {
    client.once('ready', () => {
        console.log(`Krisegis V${version} prêt !`);
    });
}