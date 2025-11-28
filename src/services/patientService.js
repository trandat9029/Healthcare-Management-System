import db from "../models";
require('dotenv').config();
// import _ from "lodash";
import emailService from './emailService'
// import { v4 as uuidv4 } from 'uuid';
const { v4: uuidv4 } = require('uuid');


let buildUrlEmail = (doctorId, token) =>{
    let result = `${process.env.FRONTEND_ORIGIN}/verify-booking?token=${token}&doctorId=${doctorId}`; 

    return result;
}

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
                    patientName: data.fullName,
                    time: data.timeString,
                    doctorName: data.doctorName,
                    language: data.language,
                    redirectLink: buildUrlEmail(data.doctorId, token)
                })

                // upsert patient
                let user = await db.User.findOrCreate({
                    where: { email : data.email },
                    defaults: {
                        email: data.email,
                        roleId: 'R3',
                        gender : data.selectedGender,
                        address: data.address,
                        firstName: data.fullName,
                        
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

let handleGetAllBooking = ({ page, limit, sortBy, sortOrder }) => {
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

            let doctors = await db.Booking.findAndCountAll({
                include: [
                    {
                        model: db.User,
                        as: 'patientData',
                        attributes: ['firstName', 'lastName'],
                    },
                    {
                        model: db.User,
                        as: 'doctorBookings',
                        attributes: ['firstName', 'lastName', 'email'],
                    },
                    {
                        model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueEn', 'valueVi'] 
                    },
                    {
                        model: db.Allcode, as: 'statusData', attributes: ['valueEn', 'valueVi'] 
                    },
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

module.exports = {
    postBookAppointmentService: postBookAppointmentService,
    postVerifyBookAppointmentService: postVerifyBookAppointmentService,
    handleGetAllBooking: handleGetAllBooking,

}