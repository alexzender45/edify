const reportRoute = require('../core/routerConfig');
const reportController = require('../controller/reportController');
const { authenticate, permit, restrict } = require('../core/userAuth');

reportRoute.post('/reportUser', authenticate, permit(['user']), restrict([true]), reportController.reportUser);
reportRoute.post('/reportPage/', authenticate, permit(['user']), restrict([true]), reportController.reportPage);
reportRoute.post('/reportChannel/', authenticate, permit(['user']), restrict([true]), reportController.reportChannel);
reportRoute.post('/reportPost/:postId', authenticate, permit(['user']), restrict([true]), reportController.reportPost);
reportRoute.post('/reportComment/:commentId', authenticate, permit(['user']), restrict([true]), reportController.reportComment);

module.exports = reportRoute;

