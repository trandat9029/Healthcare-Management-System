import { Op } from "sequelize";
import db from "../models";
import emailService from "./emailService"
require('dotenv').config();
import _, { reject } from "lodash";
const { fn, col, where } = db.Sequelize;

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: { roleId: 'R2' },
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ['password'],
                    },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Doctor_info, as: 'doctorInfoData' },  
                ],
                raw: true,
                nest: true,
            });

            if (users && users.length > 0) {
                users = users.map((item) => {
                if (item.image) {
                    item.image = Buffer.from(item.image, 'base64').toString('binary');
                }
                return item;
                });
            }

            resolve({
                errCode: 0,
                data: users,
            });
        } catch (error) {
            reject(error);
        }
    });
};



let getAllDoctors = ({ page, limit, sortBy, sortOrder, keyword, positionId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const pageNumber = Number(page) || 1;
      const pageSize = Number(limit) || 10;
      const offset = (pageNumber - 1) * pageSize;

      const allowedSortField = {
        email: 'email',
        firstName: 'firstName',
        lastName: 'lastName',
        createdAt: 'createdAt',
      };

      const sortField = allowedSortField[sortBy] || 'createdAt';
      const sortDirection =
        String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const whereUser = { roleId: 'R2' };

      if (positionId) whereUser.positionId = positionId;

      const kw = (keyword || '').trim();
      if (kw) {
        whereUser[Op.or] = [
          { firstName: { [Op.like]: `%${kw}%` } },
          { lastName: { [Op.like]: `%${kw}%` } },
        ];
      }

      const doctors = await db.User.findAndCountAll({
        where: whereUser,
        attributes: { exclude: ['password', 'image'] },
        include: [
          { model: db.Allcode, as: 'positionData', attributes: ['valueVi', 'valueEn'] },
          { model: db.Allcode, as: 'roleData', attributes: ['valueVi', 'valueEn'] },
        ],
        raw: true,
        nest: true,
        limit: pageSize,
        offset,
        order: [[sortField, sortDirection]],
        distinct: true,
      });

      resolve(doctors);
    } catch (error) {
      reject(error);
    }
  });
};


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
                    doctorInfo.clinicId = inputData.clinicId;

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
                    attributes: {
                        exclude: ['password'],
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown'],
                        },
                        {
                            model: db.Allcode,
                            as: 'positionData',
                            attributes: ['valueEn', 'valueVi'],
                        },
                        {
                            model: db.Doctor_info,
                            as: 'doctorInfoData',                // thêm alias ở đây
                            attributes: [
                                'priceId',
                                'paymentId',
                                'provinceId',
                                'specialtyId',
                                'clinicId',
                                'nameClinic',
                                'addressClinic',
                                'note',
                                'count',
                            ],
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                            ],
                        },
                    ],
                    raw: false,
                    nest: true,
                });
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


let handleGetAllSchedule = ({
    page,
    limit,
    sortBy,
    sortOrder,
    timeType,
    date,
}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pageNumber = Number(page) || 1;
            const pageSize = Number(limit) || 10;
            const offset = (pageNumber - 1) * pageSize;

            const allowedSortField = {
                date: 'date',
                timeType: 'timeType',
                doctorId: 'doctorId',
                createdAt: 'createdAt',
            };

            const sortField = allowedSortField[sortBy] || 'createdAt';
            const sortDirection =
                String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            const whereSchedule = {};
            if (timeType) {
                whereSchedule.timeType = timeType;
            }
            if (date) {
                whereSchedule.date = Number(date);
            }

            const info = await db.Schedule.findAndCountAll({
                where: whereSchedule,
                include: [
                    {
                        model: db.Allcode,
                        as: 'timeTypeData',
                        attributes: ['valueVi', 'valueEn'],
                    },
                    {
                        model: db.User,
                        as: 'doctorData',
                        attributes: ['firstName', 'lastName'],
                    },
                ],
                limit: pageSize,
                offset,
                order: [[sortField, sortDirection]],
                raw: false,
                nest: true,
                distinct: true,
            });

            resolve(info);
        } catch (error) {
            reject(error);
        }
    });
};


let handleGetScheduleByDoctor = ({
    doctorId,
    page,
    limit,
    sortBy,
    sortOrder,
    timeType,
    date,
}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pageNumber = Number(page) || 1;
            const pageSize = Number(limit) || 10;
            const offset = (pageNumber - 1) * pageSize;

            const allowedSortField = {
                date: 'date',
                timeType: 'timeType',
                doctorId: 'doctorId',
                createdAt: 'createdAt',
            };

            const sortField = allowedSortField[sortBy] || 'createdAt';
            const sortDirection =
                String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            const whereSchedule = {
                doctorId,
            };

            if (timeType) {
                whereSchedule.timeType = timeType;
            }
            if (date) {
                whereSchedule.date = Number(date);
            }

            const info = await db.Schedule.findAndCountAll({
                where: whereSchedule,
                include: [
                    {
                        model: db.Allcode,
                        as: 'timeTypeData',
                        attributes: ['valueVi', 'valueEn'],
                    },
                    {
                        model: db.User,
                        as: 'doctorData',
                        attributes: ['firstName', 'lastName'],
                    },
                ],
                limit: pageSize,
                offset,
                order: [[sortField, sortDirection]],
                raw: false,
                nest: true,
                distinct: true,
            });

            resolve(info);
        } catch (error) {
            reject(error);
        }
    });
};


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
                        model: db.Allcode,
                        as: 'positionData',
                        attributes: ['valueEn', 'valueVi']
                    },
                    { 
                        model: db.Doctor_info,
                        as: 'doctorInfoData',                 // thêm alias cho đúng
                        attributes: [
                            'priceId',
                            'paymentId',
                            'provinceId',
                            'nameClinic',
                            'addressClinic',
                            'note',
                            'count',
                        ],
                        include: [
                            { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                            { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                            { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
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


let getListPatientForDoctorService = (doctorId, date) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!doctorId || !date){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                let data = await db.Booking.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date,
                    },
                    include: [
                        { 
                            model: db.User, as: 'patientData',
                            attributes: ['email', 'firstName', 'address', 'gender'],
                            include: [
                                { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] }
                            ]
                        },
                        {
                            model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueEn', 'valueVi'] 
                        },
                        {
                            model: db.Allcode, as: 'statusData', attributes: ['valueEn', 'valueVi'] 
                        }
                    ],
                    raw: false,
                    nest: true
                })
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


let SendRemedy = (data) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!data.email || !data.doctorId || !data.patientId || !data.timeType){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                
                //update patient status
                let appointment = await db.Booking.findOne({
                    where: { 
                        doctorId: data.doctorId,
                        patientId: data.patientId,
                        timeType: data.timeType,
                        statusId: 'S2', 
                    },
                    raw: false,
                })

                if(appointment){
                    appointment.statusId = 'S3';
                    await appointment.save();
                }

                //send email remedy
                await emailService.sendAttachment(data);

                resolve({
                    errCode: 0,
                    errMessage: 'Ok'
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
    getListPatientForDoctorService: getListPatientForDoctorService,
    SendRemedy: SendRemedy,
    handleGetAllSchedule: handleGetAllSchedule,
    handleGetScheduleByDoctor: handleGetScheduleByDoctor,
}