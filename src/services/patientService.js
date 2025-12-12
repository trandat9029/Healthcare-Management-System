import db from "../models";
require('dotenv').config();
// import _ from "lodash";
import emailService from './emailService'
// import { v4 as uuidv4 } from 'uuid';
const { v4: uuidv4 } = require('uuid');
import { Op } from 'sequelize';


let buildUrlEmail = (doctorId, token) =>{
    let result = `${process.env.FRONTEND_ORIGIN}/verify-booking?token=${token}&doctorId=${doctorId}`; 

    return result;
}

let buildUrlCancelEmail = (doctorId, token) => {
    return `${process.env.FRONTEND_ORIGIN}/verify-cancel-booking?token=${token}&doctorId=${doctorId}`;
};

let postBookAppointmentService = (data) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!data.email || !data.doctorId || !data.timeType || !data.date || !data.fullName || !data.address || !data.selectedGender){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                console.log('check data', data)
                let token = uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'

                await emailService.sendSimpleEmail({
                    receiverEmail: data.email,
                    language: data.language,
                    redirectLink: buildUrlEmail(data.doctorId, token),

                    fullName: data.fullName,           // hoặc ghép từ lastName firstName
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                    address: data.address,
                    reason: data.reason,
                    birthday: data.birthday,
                    selectedGender: data.selectedGender,
                    timeString: data.timeString,
                    doctorName: data.doctorName,
                    note: data.note,
                    insuranceNumber: data.insuranceNumber,
                })

                // upsert patient
                let user = await db.User.findOrCreate({
                    where: { email : data.email },
                    defaults: {
                        email: data.email,
                        roleId: 'R3',
                        gender : data.selectedGender,
                        address: data.address,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        
                    }
                });
                if(user && user[0]){
                    await db.Booking.findOrCreate({
                        where: { patientId : user[0].id },
                        defaults : {
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            token: token,
                        },
                    })
                }
                // create a booking record

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

let postVerifyBookAppointmentService = (data) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!data.token || !data.doctorId){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{

                let appointment = await db.Booking.findOne({
                    where : {
                        doctorId : data.doctorId,
                        token: data.token,
                        statusId: 'S1' 
                    },
                    raw: false
                })

                if(appointment){
                    appointment.statusId = 'S2'
                    await appointment.save()

                    resolve({
                        errCode: 0,
                        errMessage: 'Update the appointment succeed!'
                    })
                }else{
                    resolve({
                        errCode: 2,
                        errMessage: 'Appointment has been activated or does not exist!'
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

let handleGetAllBooking = ({
    page,
    limit,
    sortBy,
    sortOrder,
    keywordDoctor,
    keywordPatient,
    timeType,
    date,
    statusId,
}) => {
    return new Promise(async (resolve, reject) => {
        try {
        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 10;
        const offset = (pageNumber - 1) * pageSize;

        const allowedSortField = {
            doctorId: 'doctorId',
            patientId: 'patientId',
            statusId: 'statusId',
            date: 'date',
            timeType: 'timeType',
            createdAt: 'createdAt',
        };

        const sortField = allowedSortField[sortBy] || 'createdAt';
        const sortDirection =
            String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // where cho bảng Booking
        const whereBooking = {};
        if (timeType) whereBooking.timeType = timeType;
        if (statusId) whereBooking.statusId = statusId;
        if (date) whereBooking.date = Number(date);

        const doctorKw = (keywordDoctor || '').trim();
        const patientKw = (keywordPatient || '').trim();

        const info = await db.Booking.findAndCountAll({
            where: whereBooking,
            include: [
            {
                model: db.User,
                as: 'patientData',
                attributes: ['firstName', 'lastName'],
                required: !!patientKw,
                where: patientKw
                ? {
                    [Op.or]: [
                        { firstName: { [Op.like]: `%${patientKw}%` } },
                        { lastName: { [Op.like]: `%${patientKw}%` } },
                    ],
                    }
                : undefined,
            },
            {
                model: db.User,
                as: 'doctorBookings',
                attributes: ['firstName', 'lastName', 'email'],
                required: !!doctorKw,
                where: doctorKw
                ? {
                    [Op.or]: [
                        { firstName: { [Op.like]: `%${doctorKw}%` } },
                        { lastName: { [Op.like]: `%${doctorKw}%` } },
                    ],
                    }
                : undefined,
            },
            {
                model: db.Allcode,
                as: 'timeTypeDataPatient',
                attributes: ['valueEn', 'valueVi'],
            },
            {
                model: db.Allcode,
                as: 'statusData',
                attributes: ['valueEn', 'valueVi'],
            },
            ],
            raw: false,
            nest: true,
            limit: pageSize,
            offset,
            order: [[sortField, sortDirection]],
            distinct: true,
        });

        resolve(info);
        } catch (error) {
        reject(error);
        }
    });
};


let handleGetAllBookedByPatient = ({ patientId, page, limit, sortBy, sortOrder }) => {
    return new Promise(async (resolve, reject) => {
        try {
        const offset = (page - 1) * limit;

        const order = [];
        if (sortBy) {
            order.push([
            sortBy,
            String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
            ]);
        } else {
            // mặc định mới nhất lên trước
            order.push(['createdAt', 'DESC']);
        }

        const result = await db.Booking.findAndCountAll({
            where: { patientId },
            limit,
            offset,
            order,
            include: [
            {
                model: db.User,
                as: 'doctorBookings',       // phải trùng alias trong model Booking
                attributes: ['id', 'firstName', 'lastName', 'image', 'positionId'],
                include: [
                {
                    model: db.Allcode,
                    as: 'positionData',
                    attributes: ['valueVi', 'valueEn'],
                },
                ],
            },
            {
                model: db.User,
                as: 'patientData',     
                attributes: ['id','email', 'firstName', 'lastName','address', 'phoneNumber'],
                
            },
            {
                model: db.Allcode,
                as: 'timeTypeDataPatient',
                attributes: ['valueVi', 'valueEn'],
            },
            {
                model: db.Allcode,
                as: 'statusData',
                attributes: ['valueVi', 'valueEn'],
            },
            ],
            distinct: true, // tránh count sai khi join nhiều bảng
            raw: false,
            nest: true,
        });

        resolve(result);
        } catch (error) {
        reject(error);
        }
    });
};


let handleSendEmailCancelBooked = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
        if (!data.email || !data.doctorId || !data.bookingId || !data.language) {
            return resolve({
            errCode: 1,
            errMessage: 'Missing required parameter!',
            });
        }

        let appointment = await db.Booking.findOne({
            where: {
            id: data.bookingId,
            doctorId: data.doctorId,
            statusId: {
                [Op.in]: ['S1', 'S2'],   // sửa ở đây
            },
            },
            raw: false,
        });

        if (!appointment) {
            return resolve({
            errCode: 2,
            errMessage: 'Appointment not found or cannot be cancelled!',
            });
        }

        const token = uuidv4();
        appointment.token = token;
        await appointment.save();

        await emailService.sendCancelEmail({
            receiverEmail: data.email,
            language: data.language,
            fullName: data.fullName,
            timeString: data.timeString,
            doctorName: data.doctorName,
            redirectLink: buildUrlCancelEmail(data.doctorId, token),
        });

        return resolve({
            errCode: 0,
            errMessage: 'Send cancel email succeed!',
        });
        } catch (error) {
        console.log(error);
        reject(error);
        }
    });
};

let handleVerifyCancelBooked = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
        if (!data.token || !data.doctorId) {
            return resolve({
            errCode: 1,
            errMessage: 'Missing required parameter!',
            });
        }

        let appointment = await db.Booking.findOne({
            where: {
            doctorId: data.doctorId,
            token: data.token,
            statusId: {
                [Op.in]: ['S1', 'S2'],   // sửa giống trên
            },
            },
            raw: false,
        });

        if (appointment) {
            appointment.statusId = 'S4';
            await appointment.save();

            return resolve({
            errCode: 0,
            errMessage: 'Update the appointment succeed!',
            });
        } else {
            return resolve({
            errCode: 2,
            errMessage: 'Appointment has been activated or does not exist!',
            });
        }
        } catch (error) {
        reject(error);
        }
    });
};

module.exports = {
    postBookAppointmentService: postBookAppointmentService,
    postVerifyBookAppointmentService: postVerifyBookAppointmentService,
    handleGetAllBooking: handleGetAllBooking,
    handleGetAllBookedByPatient: handleGetAllBookedByPatient,
    handleSendEmailCancelBooked: handleSendEmailCancelBooked,
    handleVerifyCancelBooked: handleVerifyCancelBooked,
}