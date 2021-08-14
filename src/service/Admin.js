const { validate } = require('jsonschema');
const { validateFormInputs } = require("../utils/util")
const { S3_BUCKET } = require('../core/config')
const { s3 } = require('../utils/aws')
const adminSchema = require('../models/adminModel');
const validator = require('../validation/adminSchema.json');
const { validateParameters } = require('../utils/util');


class Admin {
    constructor(data) {
        this.data = data;
        this.errors = [];
    }

    async adminExist() {
        const findAdmin = await adminSchema.findOne({ email: this.data.email }).exec();
        if (findAdmin) {
            this.errors.push('Admin already Exist');
            return true;
        }
        return false;
    }

    async create() {
        return new Promise(async (resolve, reject) => {
            const inputs = await validateFormInputs(this.data, validator);
            if(Array.isArray(inputs)) this.errors = inputs;
            await this.adminExist();
            if (this.errors.length) {
                return reject(this.errors)
            }
            new adminSchema(this.data).save()
            .then(data => {
                if (!data) {
                    this.errors.push("Unable to save data")
                    return reject(this.errors)
                }
                resolve(data)
            }).catch((err) => {
                this.errors.push("Unable to save data")
                return reject(this.errors)
            })
        })
    }

//     async login() {
//         const { email, password } = this.data;
//         const validParameters = validateParameters(["email", "password"], this.data);
//         const { isValid, messages } = validParameters;

//         if (!isValid) {
//             throw new Error(messages);
//         }

//         return await UserSchema.findByCredentials(email, password);
//     }


//     async allUsers() {
//         const users = await UserSchema.find({});
//         return users;
//     }

//     async userProfile(userId) {
//         const users = await UserSchema.findById(userId);
//         return users;
//     }

//     async deactivate(userId) {
//         const users = await UserSchema.findOneAndUpdate({ _id: userId },
//             {
//                 $set: { isActive: false },
//             }, {
//             new: true,
//         });
//         return users;
//     }

//     async saveImageToDatabase(url, userId) {

//         const user = await UserSchema.findOneAndUpdate({ _id: userId },
//             {
//                 $set: { imageUri: url },
//             }, {
//             new: true,
//         });
//         return user;
//     }

//     async updateUserProfile(userId, Key, Body) {
//         const params = {
//             Bucket: S3_BUCKET,
//             Key,
//             Body
//         }
//         s3.upload(params, (err, data) => {
//             if (err) {
//                 return err;
//             }
//             this.saveImageToDatabase(data.Location, userId);
//         })
//     }

};

module.exports = Admin;
