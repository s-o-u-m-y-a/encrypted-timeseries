import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

//read file
var data = fs.readFileSync('data.json', 'utf8');
data = JSON.parse(data);

//get the random value based on limit specified 
function getRandomIndex(limit) {
    return Math.floor(Math.random() * limit)
}

export function getRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//function generate random message
function getMessage() {

    if (data && data.names !== undefined && data.cities !== undefined) {
        const totalNames = data.names.length;
        const totalCities = data.cities.length;

        let message = {
            name: data.names[getRandomIndex(totalNames)],
            origin: data.cities[getRandomIndex(totalCities)],
            destination: data.cities[getRandomIndex(totalCities)]
        };

        return message
    }
    else {
        throw new Error('Data has no required fields');
    }

}

//function to generate hash
function getHash(message) {
    if (message !== undefined) {
        return crypto.createHash('sha256').update(message).digest('hex');
    } else {
        throw new Error('Message is required');
    }

}

//fun to add secret key along with message 
export function getSumCheckMessage() {
    let message = getMessage();
    message["secret_key"] = getHash(JSON.stringify(message));
    return message;
}

//function to generate random vector
function getInitVector() {
    // generate 16 bytes of random data
    return crypto.randomBytes(16);
}

//function to get alogrithm
function getAlogrithm() {
    //what alogrithm you wanna use for encryptions
    return "aes-256-ctr";
}

//function to generate secret key
function getSecretKey() {
    return crypto.scryptSync(process.env.SECRET_KEY, 'salt', 32);
}

//the function adds vector to the encrypted data before sending it out
function addInitVectorToMsg(initVector, encryptedData) {
    return encryptedData += initVector.toString('hex');
}

//the encryption function
export function encryptData(message) {
    try {
        const algorithm = getAlogrithm();
        const key = getSecretKey();
        const initVector = getInitVector();

        // the cipher function
        const cipher = crypto.createCipheriv(algorithm, key, initVector);

        // encrypt the message
        let encryptedData = cipher.update(message, "utf-8", "hex");
        encryptedData += cipher.final("hex");

        console.log("Encrypted message without iv: " + encryptedData, '\n');

        //send init vector along with encrypted data
        const encryptedDataWithIV = addInitVectorToMsg(initVector, encryptedData);

        console.log("Encrypted message with iv: " + encryptedDataWithIV, '\n');

        return encryptedDataWithIV;
    }
    catch (err) {
        console.log("Error caught ", err);
    }
}

// the decipher function
export function decryptedData(message) {
    try {
        const algorithm = getAlogrithm();
        const key = getSecretKey();

        message = message.toString();
        console.log('received encrypted message:', message, '\n');

        //getting {vi, data} as object
        const response = separateInitVector(message);

        const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(response.initVector, 'hex'));

        let decryptedData = decipher.update(response.data, "hex", "utf-8");

        decryptedData += decipher.final("utf8");

        console.log('after decrypting:', decryptedData, '\n');

        return decryptedData;
    }
    catch (err) {
        console.log("Error caught ", err);
    }
}

// function takes incoming message as a input and separates the vector and data from it
function separateInitVector(message) {
    const initVector = message.substring(message.length - 32);
    const data = message.substring(0, message.length - 32);

    return { initVector: initVector, data: data };
}

//validate if the decrypted data arrived is corrupted or not
export function validateData(message) {
    try {
        message = JSON.parse(message);
        let data = {
            name: message.name,
            origin: message.origin,
            destination: message.destination
        }

        let generatehash = getHash(JSON.stringify(data));

        console.log('extracted data from encrypted message', data, '\n');

        if (generatehash == message.secret_key) {
            return true;
        } else {
            return false;
        }
    }
    catch (err) {
        console.log("Error caught ", err);
    }

}


//function to add timestamp to message
export function addTimestamp(message) {
    message = JSON.parse(message);
    let data = {
        name: message.name,
        origin: message.origin,
        destination: message.destination
    }
    data["timestamp"] = new Date();

    console.log("message with timestamp", data, '\n');

    return data;
}

export function processBatch(data, batch){
    return batch.push(data);
}
