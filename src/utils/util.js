const { validate } = require('jsonschema');
const { s3 } = require("./aws");
const { throwError } = require("../utils/handleErrors");

exports.validateParameters = (expectedParameters, actualParameters) => {
  const messages = [];
  let isValid = true;

  expectedParameters.forEach((parameter) => {
    const actualParameter = actualParameters[parameter];

    if (actualParameter === null || actualParameter === undefined || actualParameter === '') {
      messages.push(`${parameter} is required`);
      isValid = false;
    }
  });
  return { isValid, messages };
};


exports.validateFormInputs = (formInputs, schema) => {
  const cleanData = validate(formInputs, schema);
  if (!cleanData.valid) {
      return cleanData.errors.map(err =>  err.stack);
  }
  return cleanData.instance;
}


exports.sendEmail = (from, to, subject, html) => {
  return { from, to, subject, html}
}

exports.uploadResourceToS3Bucket = (params) => {
    return s3.upload(params)
        .promise()
        .then(data => data.Location)
        .catch(error => {
            if(error){
                throw error;
            }
        });
}

exports.getAttachmentSizeInMegabyte = (sizeInByte) => {
    let sizeInMegaByte = sizeInByte / 1000000;
    return +(Math.round(sizeInMegaByte + "e+3")  + "e-3") + "mb"
}

exports.makeReaction = (reactions, userId, reactionType) => {
    let commentIndex = null;
    reactions.map((reaction, index) => {
        if (reaction.userId.toString() === userId.toString()) {
            if (reaction.reactionType.toString() === reactionType.toString()) {
                throwError("You Already Reacted To Comment");
            }
            else {
                commentIndex = index;
            }
        }
    });
    if (commentIndex !== null) {
        reactions.splice(commentIndex, 1);
    }
};