import bcrypt from 'bcrypt'
import db from "../models";

const salt = bcrypt.genSaltSync(10);

let createNewUser = async (data) =>{
    return new Promise( async (resolve, reject) => {
        try {
            let hashPasswordFromBcrypt = await hashUserPassword(data.password);
            await db.User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phoneNumber: data.phoneNumber ?? data.phone ,
                gender: data.gender === '1' ? true : false,
                // image: data.image,
                roleId: data.roleId,
                // positionId: data.positionId,
            })

            resolve('cerate a new user succeed!')
        } catch (error) {
            reject(error);
        }
    });
}

let hashUserPassword = (password) =>{
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword)
        } catch (error) {
            reject(error);
        }
    // const saltRounds = 10;
    // const myPlaintextPassword = 's0/\/\P4$$w0rD';
    // const someOtherPlaintextPassword = 'not_bacon';
        
    })
}

module.exports ={
    createNewUser: createNewUser,
}