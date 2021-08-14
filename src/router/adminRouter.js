const adminRoute = require('../core/routerConfig');
const adminController = require('../controller/adminController');
const { authenticate, permit } = require('../core/userAuth');
const { upload } = require('../utils/aws');


adminRoute.post('/createAdmin', adminController.createAdmin);

module.exports = adminRoute;
