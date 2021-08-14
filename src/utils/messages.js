const { ENDPOINT } = require("../core/config");

exports.resetPasswordMessage = (token) => {
    return `
        <h2>Please click the below link to reset password</h2>                
        <p>${ENDPOINT}/resetPassword/${token}</p>
    `
}


exports.otpMessage = (otp) => {
    return `
        <h2>Please copy and paste the beow OTP to complete your registration</h2>                
        <h2>${otp}</h2>`
}

