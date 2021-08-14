const User = require("../service/User");
const { error, success } = require("../utils/baseController");
const { generateAuthToken } = require("../core/userAuth");
const { logger } = require("../utils/logger");
const crypto = require("crypto");
const { OTP_SECRET, EMAIL_SENDER } = require("../core/config");
const msg = require('../utils/mailgun')
const { resetPasswordMessage, otpMessage } = require("../utils/messages");
const { sendEmail } = require("../utils/util");

exports.sendOtp = async (req, res) => {
    const { email } = req.body
    if (!email) {
        return error(res, { code: 400, message: "Email is required" })
    }

    const otp = Math.floor(Math.random() * 900000);
    const duration = 1000 * 60 * 20
    const expires = Date.now() + duration
    const data = `${email}.${otp}.${expires}`
    const hash = crypto.createHmac("sha256", OTP_SECRET).update(data).digest("hex")
    const fullHash = `${hash}.${expires}`

    const htmlMessage = otpMessage(otp);
    const mail = sendEmail(EMAIL_SENDER, email, 'OTP Code', htmlMessage)


    msg.messages().send(mail)
        .then(() => success(res, { otp, hash: fullHash }, "OTP has been sent to yout email"))
        .catch((err) => res.json({ error: err.message }))
}

exports.signup = async (req, res) => {
    const { hash, otp, email } = req.body;
    const [hashValue, expires] = hash.split(".")
    if (Date.now() > parseInt(expires)) {
        return error(res, { code: 400, message: "Expired Token" })
    }

    const data = `${email}.${otp}.${expires}`
    const newHash = crypto.createHmac("sha256", OTP_SECRET).update(data).digest("hex")
    if (newHash !== hashValue) {
        return error(res, { code: 400, message: "Unable to verify OTP" })
    }

    const user = new User(req.body);
    user.signup()
        .then(async (data) => {
            const token = await generateAuthToken({ userId: data._id, isVerified: data.verified, isActive: data.isActive })
            if (!token) {
                return error(res, { code: 400, message: "Unable to Generate Token" })
            }
            return success(res, { data, token });
        })
        .catch((err) => {
            logger.error("Error occurred at signup", err);
            return error(res, { code: 400, message: err })
        })
}

exports.login = async (req, res) => {
    try {
        const userDetails = await new User(req.body).login();
        const token = await generateAuthToken({ userId: userDetails._id, isVerified: userDetails.verified, isActive: userDetails.isActive });
        return success(res, { userDetails, token });
    } catch (err) {
        logger.error("Error occurred at login", err.message);
        return error(res, { code: err.code, message: err.message });
    }
}

exports.getAllUser = async (req, res) => {
    try {
        const user = await new User(req.body).allUsers();
        return success(res, { user });
    } catch (err) {
        logger.error("Unable to complete request", err);
        return error(res, { code: 400, message: err.message });
    }
}

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await new User(req.body).userProfile(userId);
        return success(res, { user });
    } catch (err) {
        logger.error("Unable to complete request", err);
        return error(res, { code: 400, message: err.message });
    }
}

exports.deactivateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const password = req.body.password;
        const user = await new User(req.body).deactivate(password, userId);
        return success(res, { user }, "So Sad To See You Deactivate");
    } catch (err) {
        logger.error("Unable to complete request", err);
        return error(res, { code: 400, message: err.message });
    }
}

exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const Key = req.file.originalname;
        const Body = req.file.buffer
        await new User(req).updateUserProfile(userId, Key, Body);
        return success(res);
    } catch (err) {
        logger.error("Unable to complete request", err);
        return error(res, { code: 400, message: err.message });
    }
};

exports.followUser = async (req, res) => {
    try {
        const followDetails = { userAddress: req.params.userAddress, userId: req.user._id };
        const userDetails = await new User(followDetails).followUser();
        return success(res, userDetails);
    } catch (err) {
        logger.error(`Unable to follow user ${err}`);
        return error(res, { code: err.code, message: err.message });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const unfollowDetails = { userAddress: req.params.userAddress, userId: req.user._id };
        const userDetails = await new User(unfollowDetails).unfollowUser();
        return success(res, userDetails);
    } catch (err) {
        logger.error(`Unable to unfollow user ${err}`);
        return error(res, { code: err.code, message: err.message });
    }
};

exports.updateUserDetails = async (req, res) => {
    try {
        const key = req.body;
        const userUpdate = req.user;
        const user = await new User(req).updateUserDetails(key, userUpdate);
        return success(res, { user });
    } catch (err) {
        logger.error("Unable to complete request", err);
        return error(res, { code: 400, message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const password = req.body.password;
        const userId = req.params.userId;
        const user = await new User(req.body).saveToArchive(userId, password);
        return success(res, { user }, "Your Account Has Been Successfully Deleted, So Sad To See You Go");
    } catch (err) {
        logger.error("Unable to complete request", err);
        return error(res, { code: 400, message: err.message });
    }
}

exports.reactivateUser = async (req, res) => {
    try {
        const data = req.body.data;
        const userId = req.params.userId;
        const user = await new User(req.body).reactivate(userId, data);
        return success(res, { user }, "Congratulations Your Account Is Now Re-activated");
    } catch (err) {
        logger.error("Unable to complete request", err);
        return error(res, { code: err.code, message: err.message });
    }
}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body
    const user = await new User({ email }).emailExist()
    if (user.status) {
        const token = await generateAuthToken({ userId: user.data._id })
        const htmlMessage = resetPasswordMessage(token)
        const mail = sendEmail(EMAIL_SENDER, email, 'Account Activation Link', htmlMessage)
        const updateLink = await user.data.updateOne({ resetLink: token });
        if (updateLink) {
            try {
                const sendMessage = await msg.messages().send(mail);
                if (sendMessage) {
                    return success(res, { user }, "Check your email and follow the instruction");
                }
            } catch (error) {
                return error(res, { code: 400, message: err.message });
            }
        }
    } else {
        return error(res, { code: 400, message: "Enter a registered email" });
    }
}

exports.resetPassword = (req, res) => {
    const { newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
        return error(res, { code: 400, message: "Password Mismatch" });
    }

    new User(req.body).resetPassword()
        .then(data => success(res, "Password has been reset"))
        .catch(err => error(res, { code: 400, message: err }))
}
