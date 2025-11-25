import { where } from "sequelize";
import db from "../models"
require('dotenv').config();


let handleCreateHandbook = (data) =>{
     return new Promise( async (resolve, reject) =>{
            try {
                if(!data.name || !data.author || !data.datePublic || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown){
                    resolve({
                        errCode: 1,
                        errMessage: 'Missing required parameter!',
                    })
                }else{
                    
                    await db.Handbook.create({
                        name: data.name,
                        author: data.author,
                        datePublic: data.datePublic,
                        image: data.imageBase64,
                        descriptionHTML: data.descriptionHTML,
                        descriptionMarkdown: data.descriptionMarkdown,
                    })

                    resolve({
                        errCode: 0,
                        errMessage: 'Save handbook succeed!'
                    })
                }
            } catch (error) {
                reject(error)
            }
        })
} 

let handleGetAllHandbook = () =>{
     return new Promise( async (resolve, reject) =>{
            try {
                let data = await db.Handbook.findAll({

                });
                if(data && data.length > 0){
                    data.map(item =>{
                        item.image = new Buffer(item.image, 'base64').toString('binary');
                        return item;
                    })
                }
                resolve({
                    errCode: 0,
                    errMessage: 'OK',
                    data
                })
            } catch (error) {
                reject(error)
            }
        })
} 

let handleGetDetailHandbookById = (inputId) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!inputId){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                let data = await db.Handbook.findOne({
                        where: {
                            id: inputId,
                        },
                        attributes: ['name', 'author', 'datePublic', 'descriptionHTML', 'descriptionMarkdown']
                    })

                    if(!data){
                        resolve({
                            errCode: 1,
                            errMessage: 'Handbook not found!',
                            data: {}
                    }) 
                         
                    }
                    resolve({
                        errCode: 0,
                        errMessage: 'ok',
                        data
                    }) 
            }
        } catch (error) {
            reject(error)
        }
    })
}

module.exports ={
    handleCreateHandbook: handleCreateHandbook,
    handleGetAllHandbook: handleGetAllHandbook,
    handleGetDetailHandbookById: handleGetDetailHandbookById,

}