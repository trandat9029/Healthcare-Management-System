import { where } from "sequelize";
import db from "../models";
import { raw } from "body-parser";
require('dotenv').config();
import _ from "lodash";
import emailService from './emailService'

let postBookAppointmentService = (data) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!data.email || !data.doctorId || !data.timeType || !data.date){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{

                await emailService.sendSimpleEmail({
                    receiverEmail: data.email,
                    patientName: 'Onizuka',
                    time: '8:00 - 9:00 Sunday 29/09/2025',
                    doctorName: 'Eikichi',
                    redirectLink: 'https://www.youtube.com/watch?v=0GL--Adfqhc&list=PLncHg6Kn2JT6E38Z3kit9Hnif1xC_9VqI&index=97'
                })

                // upsert patient
                let user = await db.User.findOrCreate({
                    where: { email : data.email },
                    defaults: {
                        email: data.email,
                        roleId: 'R3'
                    }
                });
                console.log('check user: ', user[0]);
                if(user && user[0]){
                    await db.Booking.findOrCreate({
                        where: { patientId : user[0].id },
                        defaults : {
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
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

module.exports = {
    postBookAppointmentService: postBookAppointmentService,
}