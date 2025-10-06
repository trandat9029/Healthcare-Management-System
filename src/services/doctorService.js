import { where } from "sequelize";
import db from "../models";
import { raw } from "body-parser";
require('dotenv').config();
import _, { reject } from "lodash";


const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitInput) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: {roleId : 'R2'},
                order: [['createdAt', 'DESC']],
                attributes:{
                    exclude: ['password']
                },
                
                include: [
                    {model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi']},
                    {model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi']},
                ],
                raw: true,
                nest: true
            })
            resolve({
                errCode: 0,
                data: users,
            })
        } catch (error) {
            reject(error)
        }
    })
}

let getAllDoctors = () =>{
    return new Promise( async (resolve, reject) =>{
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image']
                },

            })
            resolve({
                errCode: 0,
                data: doctors
            })

        } catch (error) {
            reject(error);
        }
    })
}

let checkRequiredFields = (inputData) =>{
    let arrFields = ['doctorId', 'contentHTML', 'contentMarkdown', 'action', 'selectedPrice', 'selectedPayment', 'selectedProvince', 'nameClinic', 'addressClinic', 'note', 'specialtyId'];
    
    let isValid = true;
    let element = '';
    for(let i =0; i < arrFields.length; i++){
        if(!inputData[arrFields[i]]){
            isValid = false;
            element = arrFields[i];
            break;
        }
    }

    return {
        isValid: isValid,
        element: element,
    }
}

let saveDetailInfoDoctor = (inputData) =>{
    return new Promise( async (resolve, reject) => {
        try {
            let checkObj = checkRequiredFields(inputData);

            if(checkObj.isValid === false){
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter: ${checkObj.element} `
                })
            }else{

                //upsert to markdown table
                if(inputData.action === 'CREATE'){
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId,
                    
                    })
                }else if(inputData.action === 'EDIT'){
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false
                    })

                    if(doctorMarkdown){
                        doctorMarkdown.contentHTML = inputData.contentHTML;
                        doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
                        doctorMarkdown.description = inputData.description;

                        await doctorMarkdown.save()
                    }
                }

                //upsert to doctor_info table
                let doctorInfo = await db.Doctor_info.findOne({
                    where: {
                        doctorId: inputData.doctorId,
                    },
                    raw: false
                })
                if(doctorInfo){
                    //update
                    doctorInfo.doctorId = inputData.doctorId;
                    doctorInfo.priceId = inputData.selectedPrice;
                    doctorInfo.paymentId = inputData.selectedPayment;
                    doctorInfo.provinceId = inputData.selectedProvince;
                    doctorInfo.nameClinic = inputData.nameClinic;
                    doctorInfo.addressClinic = inputData.addressClinic;
                    doctorInfo.note = inputData.note;
                    doctorInfo.specialtyId = inputData.specialtyId;
                    doctorInfo.clinicId = inputData.specialtyId;

                    await doctorInfo.save()

                }else{
                    //create
                    await db.Doctor_info.create({
                        doctorId: inputData.doctorId,
                        priceId: inputData.selectedPrice,
                        paymentId: inputData.selectedPayment,
                        provinceId: inputData.selectedProvince,
                        nameClinic: inputData.nameClinic,
                        addressClinic: inputData.addressClinic,
                        note: inputData.note,
                        specialtyId: inputData.specialtyId,
                        clinicId: inputData.clinicId,
                    
                    })
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Save info doctor succeed!'
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getDetailDoctorByIdService = (inputId) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!inputId) {
                resolve({
                    errCode: -1,
                    errMessage: 'Missing required parameter!'
                })
            }else{
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes:{
                        exclude: ['password']
                    },
                    
                    include: [
                        { 
                            model: db.Markdown,  
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        },
                        { 
                            model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi']
                        },
                        { 
                            model: db.Doctor_info,  
                            attributes: ['priceId', 'paymentId', 'provinceId', 'nameClinic', 'addressClinic', 'note', 'count'],
                            include: [
                                {model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi']},
                            ]

                        },
                    ],
                    raw: false,
                    nest: true
                })

                if(data && data.image ){
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }

                if(!data) data = {};

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

let bulkCreateScheduleService = (data) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!data.arrSchedule || !data.doctorId || !data.formatedDate){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                let schedule = data.arrSchedule;
                if(schedule && schedule.length > 0){
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }

                //get all existing
                let existing = await db.Schedule.findAll(
                    {
                        where: {doctorId: data.doctorId, date: data.formatedDate},
                        attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                        raw: true
                    }
                )

                // compare different
                let toCreate = _.differenceWith(schedule, existing, (a, b) =>{
                    return a.timeType === b.timeType && +a.date === +b.date;
                });

                //crate data
                if(toCreate && toCreate.length > 0){
                    await db.Schedule.bulkCreate(toCreate);
                }
                
                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }

        } catch (error) {
            reject(error);
        }
    })
}


let getScheduleByDateService = (doctorId, date) =>{
    return new Promise(async (resolve, reject) => {
        try {
            if(!doctorId || !date){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                let dataSchedule = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date,
                    },
                    include: [
                        { 
                            model: db.Allcode, as: 'timeTypeData', attributes: ['valueVi', 'valueEn']
                        },

                        { 
                            model: db.User, as: 'doctorData', attributes: ['firstName', 'lastName']
                        },
                    ],
                    raw: false,
                    nest: true
                })

                if(!dataSchedule) dataSchedule = [];

                resolve({
                    errCode: 0,
                    data: dataSchedule,
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getExtraInfoDoctorByIdService = (doctorId) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!doctorId){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                let data = await db.Doctor_info.findOne({
                    where: {
                        doctorId: doctorId
                    },
                    attributes: {
                        exclude: ['id', 'doctorId']
                    },
                    include: [
                        {model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi']},
                        {model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi']},
                        {model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi']},
                    ],
                    raw: false,
                    nest: true
                })
                if(!data) data = {};
                resolve({
                    errCode: 0,
                    data: data,
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

let getProfileDoctorByIdService = (inputId) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!inputId){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes:{
                        exclude: ['password']
                    },
                    
                    include: [
                        { 
                            model: db.Markdown,  
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        },
                        { 
                            model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi']
                        },
                        { 
                            model: db.Doctor_info,  
                            attributes: ['priceId', 'paymentId', 'provinceId', 'nameClinic', 'addressClinic', 'note', 'count'],
                            include: [
                                {model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi']},
                            ]

                        },
                    ],
                    raw: false,
                    nest: true
                })

                if(data && data.image ){
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }

                if(!data) data = {};

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}


module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    saveDetailInfoDoctor: saveDetailInfoDoctor,
    getDetailDoctorByIdService: getDetailDoctorByIdService,
    bulkCreateScheduleService: bulkCreateScheduleService,
    getScheduleByDateService: getScheduleByDateService,
    getExtraInfoDoctorByIdService: getExtraInfoDoctorByIdService,
    getProfileDoctorByIdService: getProfileDoctorByIdService,
    

}