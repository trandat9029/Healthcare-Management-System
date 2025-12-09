import { Op, where } from "sequelize";
import db, { Sequelize } from "../models"
require('dotenv').config();


let createSpecialtyService = (data) =>{
     return new Promise( async (resolve, reject) =>{
            try {
                if(!data.name || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown){
                    resolve({
                        errCode: 1,
                        errMessage: 'Missing required parameter!',
                    })
                }else{
                    
                    await db.Specialty.create({
                        name: data.name,
                        image: data.imageBase64,
                        descriptionHTML: data.descriptionHTML,
                        descriptionMarkdown: data.descriptionMarkdown,
                    })

                    resolve({
                        errCode: 0,
                        errMessage: 'Save info patient succeed!'
                    })
                }
            } catch (error) {
                reject(error)
            }
        })
} 

let getAllSpecialtyService = ({
    page = 1,
    limit = 10,
    sortBy = 'name',
    sortOrder = 'ASC',
    keyword,
    }) => {
    return new Promise(async (resolve, reject) => {
        try {
        // nếu limit = 'ALL' thì lấy tất cả không phân trang
        const isGetAll = String(limit).toUpperCase() === 'ALL';

        let whereCondition= {};

        if(keyword){
            whereCondition = Sequelize.where(
                Sequelize.col("name"),
                { 
                    [Op.like]: Sequelize.literal(`BINARY '%${keyword}%'`) 
                }
            )
        }

        let result;

        if (isGetAll) {
            result = await db.Specialty.findAndCountAll({
                where: whereCondition,
                order: [[sortBy, sortOrder.toUpperCase()]],
            });
        } else {
            page = +page || 1;
            limit = +limit || 10;
            const offset = (page - 1) * limit;
            

            result = await db.Specialty.findAndCountAll({
                where: whereCondition,
                offset,
                limit,
                order: [[sortBy, sortOrder.toUpperCase()]],
            });
        }

        let specialties = result.rows || [];
        if (specialties.length > 0) {
            specialties = specialties.map((item) => {
            if (item.image) {
                item.image = Buffer.from(item.image, 'base64').toString('binary');
            }
            return item;
            });
        }

        resolve({
            errCode: 0,
            errMessage: 'ok',
            specialties,
            total: result.count,
            page: isGetAll ? 1 : page,
            limit: isGetAll ? 'ALL' : limit,
        });
        } catch (error) {
        reject(error);
        }
    });
};


let getDetailSpecialtyByIdService = (inputId, location) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!inputId || !location){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                let data = await db.Specialty.findOne({
                    where: {
                        id: inputId,
                    },
                    attributes: ['name', 'image', 'descriptionHTML', 'descriptionMarkdown']
                })

                if (data) {
                    // convert ảnh
                    if (data.image) {
                        data.image = Buffer.from(data.image, 'base64').toString('binary');
                    }

                    let doctorSpecialty = [];    
                    if(location === 'ALL'){
                        doctorSpecialty = await db.Doctor_info.findAll({
                            where: { specialtyId : inputId },
                            attributes: ['doctorId', 'provinceId']
                        })
                    } else {
                        doctorSpecialty = await db.Doctor_info.findAll({
                            where: {
                                specialtyId : inputId,
                                provinceId : location
                            },
                            attributes: ['doctorId', 'provinceId']
                        })
                    }
                    
                    data.doctorSpecialty = doctorSpecialty;
                } else {
                    data = {}
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


let handleUpdateSpecialty = (data) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!data.id){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                let specialty = await db.Specialty.findOne({
                    where: {
                        id: data.id,    
                    },
                    raw: false,
                })

                if(specialty){
                    specialty.name = data.name; 
                    specialty.descriptionHTML = data.descriptionHTML;
                    specialty.descriptionMarkdown = data.descriptionMarkdown; 
                    specialty.image = data.imageBase64;  
                    
                    await specialty.save();

                    resolve({
                        errCode: 0,
                        errMessage: 'Update the specialty succeed!',
                    }) 
                }else{
                    resolve({
                        errCode: 1,
                        errMessage: 'Specialty not found!',
                    });
                }     
            }
        } catch (error) {
            reject(error)
        }
    })    
}

let handleDeleteSpecialty = (inputId) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!inputId){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                let data = await db.Specialty.findOne({
                    where: {
                        id: inputId,
                    },
                });

                if(!data){
                    resolve({
                        errCode: 2,
                        errMessage: 'Specialty not found!',
                    })        
                }
                await db.Specialty.destroy({
                    where: {id: inputId}
                })
                resolve({
                    errCode: 0,
                    errMessage: 'The specialty is deleted',
                }) 
            }
        } catch (error) {
            reject(error)
        }
    })
}

module.exports ={
    createSpecialtyService: createSpecialtyService,
    getAllSpecialtyService: getAllSpecialtyService,
    getDetailSpecialtyByIdService: getDetailSpecialtyByIdService,
    handleUpdateSpecialty: handleUpdateSpecialty,
    handleDeleteSpecialty: handleDeleteSpecialty,
}