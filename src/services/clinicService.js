
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

let getAllClinicService = () =>{
    return new Promise( async (resolve, reject) =>{
        try {
            let data = await db.Clinic.findAll({

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
                            attributes: ['name', 'address', 'descriptionHTML', 'descriptionMarkdown']
                        })
    
                        if(data){
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

module.exports ={
    createClinicService: createClinicService,
    getAllClinicService: getAllClinicService,
    getDetailClinicByIdService: getDetailClinicByIdService,

}
