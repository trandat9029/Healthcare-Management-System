import { where } from "sequelize";
import db from "../models";
import { raw } from "body-parser";
require('dotenv').config();
import _ from "lodash";


let postBookAppointmentService = (data) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!data.email || !data.doctorId || !data.timeType || !data.date){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
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