import { where } from "sequelize";
import db from "../models";
import bcrypt from 'bcrypt';
import { raw } from "body-parser";

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) =>{
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword)
        } catch (error) {
            reject(error);
        }
    })
}

let checkUserEmail = (userEmail) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            let user = await db.User.findOne({
                where: {email: userEmail}
            });
            if(user){
                resolve(true);
            }else{
                resolve(false);
            }
        } catch (error) {
            reject(error);
        }
    });
}


let handleUserLogin = (email, password) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            let userData = {};

            let isExist = await checkUserEmail(email);
            if(isExist){
                //user already exist
                let user = await db.User.findOne({
                    where: {email: email},
                    attributes: ['email', 'roleId', 'password'],
                    raw: true,
                });
                if(user){
                    //compare password
                    let check = await bcrypt.compareSync(password, user.password);
                    if(check){
                        userData.errCode = 0;
                        userData.errMessage = 'Oce';

                        delete user.password;
                        userData.user = user;
                    }else{
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong password!';
                    }
                }else{
                    //return error
                    userData.errCode = 2;
                    userData.errMessage = `User's not found`;
                    resolve(userData);
                }
            }else{
                //return error
                userData.errCode = 1;
                userData.errMessage = `Your's Email isn't exist in your system. Pleas try other email!`;
            }
            resolve(userData);
        } catch (error) {
            reject(error);
        }
    });
}

let getAllUsers = (userId) =>{
    return new Promise( async (resolve, reject) => {
        try {
            let users = '';
            if(userId === 'ALL'){
                users = await db.User.findAll({
                    attributes:{
                        exclude: ['password']
                    }
                })    
            }
            if(userId && userId !== 'ALL'){
                users = await db.User.findOne({
                    where: {id: userId}
                }) 
            }
            resolve(users)
        } catch (error) {
            reject(error);
        }
    })
}

let createNewUser = (data) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            //check email exist?
            let check = await checkUserEmail(data.email);
            if(check === true){
                resolve({
                    errCode: 1,
                    message: 'Your email is already in used, Plz try another email',
                }) 
            }

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
            resolve({
                errCode: 0,
                message: 'OK',
            })            
        } catch (error) {
            reject(error);
        }
    })
}

let deleteUser = (userId) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            let user = await db.User.findOne({
                where: {id : userId}
            });
            if(!user){
                resolve({
                    errCode: 2,
                    errMessage: `The user isn't exist`, 
                })
            }
            await db.User.destroy({
                where: {id: userId}
            })
            resolve({ 
                errCode: 0,
                message: `The user is deleted`,
            })
        } catch (error) {
            reject(error);
        }
    });
}

let updateUserData = (data) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!data.id){
                resolve({
                    errCode: 2,
                    errMessage: 'Missing require parameter!',
                })
            }
            let user = await db.User.findOne({
                where: { id: data.id},
                raw: false
            });
            if(user){
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;

                await user.save();

                resolve({
                    errCode: 0,
                    message: 'Update the user succeed!',
                })
            }else{
                resolve({
                    errCode: 1,
                    errMessage: 'User not found!',
                });
            }            
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUserData: updateUserData,
    
}