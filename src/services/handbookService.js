import { where } from "sequelize";
import db from "../models"
import { raw } from "body-parser";
require('dotenv').config();


let handleCreateHandbook = (data) =>{
     return new Promise( async (resolve, reject) =>{
            try {
                if(!data.name || !data.author || !data.datePublish || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown){
                    resolve({
                        errCode: 1,
                        errMessage: 'Missing required parameter!',
                    })
                }else{
                    
                    await db.Handbook.create({
                        name: data.name,
                        author: data.author,
                        datePublish: data.datePublish,
                        status: data.status,
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

let handleEditHandbook= (data) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!data.id || !data.name || !data.author || !data.status || !data.datePublish){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                let handbook = await db.Handbook.findOne({
                    where: {
                        id: data.id,    
                    },
                    raw: false,
                })

                if(handbook){
                    handbook.name = data.name; 
                    handbook.author = data.author; 
                    handbook.datePublish = data.datePublish;
                    handbook.descriptionHTML = data.descriptionHTML; 
                    handbook.descriptionMarkdown = data.descriptionMarkdown; 
                    handbook.image = data.imageBase64; 
                    handbook.status = data.status;  
                    
                    await handbook.save();

                    resolve({
                        errCode: 0,
                        errMessage: 'Update the handbook succeed!',
                    }) 
                }else{
                    resolve({
                        errCode: 1,
                        errMessage: 'Handbook not found!',
                    });
                }     
            }
        } catch (error) {
            reject(error)
        }
    })
}

let handlePostHandbook = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id || data.status === undefined || data.status === null) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter!',
        })
      } else {
        let handbook = await db.Handbook.findOne({
          where: { id: data.id },
          raw: false,
        });

        if (handbook) {
          handbook.status = data.status;   // true hoặc false đều được
          await handbook.save();

          resolve({
            errCode: 0,
            errMessage: 'Update the handbook post succeed!',
          });
        } else {
          resolve({
            errCode: 1,
            errMessage: 'Handbook not found!',
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};


let handleGetAllHandbook = (page, limit, sortBy, sortOrder) => {
    return new Promise(async (resolve, reject) => {
        try {
        const offset = (page - 1) * limit;

        let result = await db.Handbook.findAndCountAll({
            limit,
            offset,
            order: [[sortBy, sortOrder]],   // ví dụ sortBy = 'name', sortOrder = 'ASC'
            raw: false,
            nest: true,
        });

        let data = result.rows || [];
        if (data.length > 0) {
            data = data.map(item => {
            if (item.image) {
                item.image = Buffer.from(item.image, 'base64').toString('binary');
            }
            return item;
            });
        }

        resolve({
            errCode: 0,
            errMessage: 'OK',
            data,
            total: result.count,
            page,
            limit,
        });
        } catch (error) {
        reject(error);
        }
    });
};

let handleGetListPostHandbook = () =>{
     return new Promise( async (resolve, reject) =>{
            try {
                let data = await db.Handbook.findAll({
                    where: {status: true}
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
                            status: true,
                        },
                        attributes: ['name', 'author', 'datePublish', 'descriptionHTML', 'descriptionMarkdown']
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

let handleDeleteHandbook = (inputId) =>{
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
                });

                if(!data){
                    resolve({
                        errCode: 2,
                        errMessage: 'Handbook not found!',
                    })        
                }
                await db.Handbook.destroy({
                    where: {id: inputId}
                })
                resolve({
                    errCode: 0,
                    errMessage: 'The handbook is deleted',
                }) 
            }
        } catch (error) {
            reject(error)
        }
    })
}

module.exports ={
    handleCreateHandbook: handleCreateHandbook,
    handleEditHandbook: handleEditHandbook,
    handlePostHandbook: handlePostHandbook,
    handleGetAllHandbook: handleGetAllHandbook,
    handleGetListPostHandbook: handleGetListPostHandbook,
    handleGetDetailHandbookById: handleGetDetailHandbookById,
    handleDeleteHandbook: handleDeleteHandbook
}