const userRoute = require('../core/routerConfig');
const userController = require('../controller/userController');
const { authenticate, permit, restrict } = require('../core/userAuth');
const { upload } = require('../utils/aws');

userRoute.post('/sendOTP', userController.sendOtp);
userRoute.post('/signup', userController.signup);
userRoute.post('/login', userController.login);
userRoute.get('/all-users', authenticate, permit(['user']), restrict([true]), userController.getAllUser);
userRoute.post('/forgotPassword', userController.forgotPassword);
userRoute.post('/resetPassword', userController.resetPassword);
userRoute.get('/profile/:userId', authenticate, permit(['user']), userController.getUserProfile);
userRoute.patch('/profile/:userId/deactivate', authenticate, permit(['user']), restrict([true]), userController.deactivateUser);
userRoute.post('/profile/:userId/update-image', authenticate, permit(['user']), upload, restrict([true]), userController.updateUserProfile);
userRoute.put('/follow/:userId/:followerId', authenticate, permit(['user']), restrict([true]), userController.followUser);
userRoute.put('/unfollow/:userId/:followerId', authenticate, permit(['user']), restrict([true]), userController.unfollowUser);
userRoute.put('/profile/update-details', authenticate, permit(['user']), restrict([true]), userController.updateUserDetails);
userRoute.delete('/profile/:userId/delete-user', authenticate, permit(['user']), restrict([true]), userController.deleteUser);
userRoute.patch('/profile/:userId/reactivate', authenticate, permit(['user']), userController.reactivateUser);

module.exports = userRoute;
