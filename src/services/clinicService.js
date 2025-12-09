
import db from "../models"
require('dotenv').config();

let createClinicService = (data) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!data.name || !data.address || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{          
                await db.Clinic.create({
                    name: data.name,
                    address: data.address,
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

let getAllClinicService = (page, limit, sortBy, sortOrder) => {
    return new Promise(async (resolve, reject) => {
        try {
            const isGetAll = String(limit).toUpperCase() === "ALL";

            sortBy = sortBy || "name";
            sortOrder = sortOrder === "DESC" ? "DESC" : "ASC";

            let result;
5
            if (isGetAll) {
                // lấy tất cả không phân trang
                result = await db.Clinic.findAndCountAll({
                order: [[sortBy, sortOrder]],
                });
            } else {
                // lấy có phân trang như cũ
                page = +page || 1;
                limit = +limit || 8;
                const offset = (page - 1) * limit;

                result = await db.Clinic.findAndCountAll({
                offset,
                limit,
                order: [[sortBy, sortOrder]],
                });
            }

            let clinics = result.rows || [];
            if (clinics.length > 0) {
                clinics = clinics.map((item) => {
                if (item.image) {
                    item.image = Buffer.from(item.image, "base64").toString("binary");
                }
                return item;
                });
            }

            resolve({
                errCode: 0,
                errMessage: "OK",
                data: clinics,
                total: result.count,
                page: isGetAll ? 1 : page,
                limit: isGetAll ? "ALL" : limit,
            });
        } catch (error) {
            reject(error);
        }
    });
};


let getDetailClinicByIdService = (inputId) =>{
    return new Promise( async (resolve, reject) =>{
            try {
                if(!inputId ){
                    resolve({
                        errCode: 1,
                        errMessage: 'Missing required parameter!',
                    })
                }else{
                    let data = await db.Clinic.findOne({
                            where: {
                                id: inputId,
                            },
                            attributes: ['name', 'address', 'descriptionHTML', 'descriptionMarkdown', 'image']
                        })
    
                        if(data){

                            // convert ảnh
                            if (data.image) {
                                data.image = Buffer.from(data.image, 'base64').toString('binary');
                            }

                            let doctorClinic = [];    

                            doctorClinic = await db.Doctor_info.findAll({
                                where: {
                                    clinicId : inputId
                                },
                                attributes: ['doctorId']
                            })
                            data.doctorClinic = doctorClinic;
                        }else{
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

let handleUpdateClinic = (data) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!data.id){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                let clinic = await db.Clinic.findOne({
                    where: {
                        id: data.id,    
                    },
                    raw: false,
                })

                if(clinic){
                    clinic.name = data.name; 
                    clinic.address = data.address; 
                    clinic.descriptionHTML = data.descriptionHTML;
                    clinic.descriptionMarkdown = data.descriptionMarkdown; 
                    clinic.image = data.imageBase64;  
                    
                    await clinic.save();

                    resolve({
                        errCode: 0,
                        errMessage: 'Update the clinic succeed!',
                    }) 
                }else{
                    resolve({
                        errCode: 1,
                        errMessage: 'Clinic not found!',
                    });
                }     
            }
        } catch (error) {
            reject(error)
        }
    })
}

module.exports ={
    createClinicService: createClinicService,
    getAllClinicService: getAllClinicService,
    getDetailClinicByIdService: getDetailClinicByIdService,
    handleUpdateClinic: handleUpdateClinic

}
