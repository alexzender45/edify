const baseRoute = require('../core/routerConfig');

baseRoute.get('/', (req, res) => res.status(200).send('Edify Backend Running...'));

module.exports = baseRoute;
