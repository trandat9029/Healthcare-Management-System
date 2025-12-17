import patientService from '../services/patientService'
import db from "../models";

let postBookAppointment = async (req, res) =>{
    try {
        let info = await patientService.postBookAppointmentService(req.body);
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let postVerifyBookAppointment = async (req, res) =>{
    try {
        let info = await patientService.postVerifyBookAppointmentService(req.body);
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let handleGetAllBooking = async (req, res) => {
    try {
        let {
            page,
            limit,
            sortBy,
            sortOrder,
            keywordDoctor,
            keywordPatient,
            timeType,
            date,
            statusId,
        } = req.query;

        let result = await patientService.handleGetAllBooking({
            page,
            limit,
            sortBy,
            sortOrder,
            keywordDoctor,
            keywordPatient,
            timeType,
            date,
            statusId,
        });

        return res.status(200).json({
            errCode: 0,
            errMessage: 'Ok',
            bookings: result.rows,
            total: result.count,
            page: Number(page) || 1,
            limit: Number(limit) || 10,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server',
        });
    }
};

let handleGetAllBookedByPatient = async (req, res) => {
    try {
        let { page, limit, sortBy, sortOrder, email } = req.query;

        page = Number(page) || 1;
        limit = Number(limit) || 10;

        if (!email) {
        return res.status(400).json({
            errCode: 1,
            errMessage: 'Missing email',
        });
        }

        // tìm patient theo email
        const patient = await db.User.findOne({
        where: { email },
        attributes: ['id', 'email', 'firstName', 'lastName'],
        });

        if (!patient) {
        return res.status(404).json({
            errCode: 2,
            errMessage: 'Patient not found',
        });
        }

        const patientId = patient.id;

        let result = await patientService.handleGetAllBookedByPatient({
            patientId,
            page,
            limit,
            sortBy,
            sortOrder,
        });

        return res.status(200).json({
            errCode: 0,
            errMessage: 'Ok',
            bookings: result.rows,
            total: result.count,
            page,
            limit,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
        errCode: -1,
        errMessage: 'Error from the server',
        });
    }
};

let handleSendEmailCancelBooked = async (req, res) => {     
     try {
        let info = await patientService.handleSendEmailCancelBooked(req.body);
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
};

let handleVerifyCancelBooked = async (req, res) =>{
    try {
        let info = await patientService.handleVerifyCancelBooked(req.body);
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let handleGetAllPatient = async (req, res) =>{
    try {
        let { page, limit, sortBy, sortOrder, keyword,} = req.query;
        let result = await patientService.handleGetAllPatient({
            page,
            limit,
            sortBy,
            sortOrder,
            keyword,
        });
        return res.status(200).json({
            errCode: 0,
            errMessage: 'Ok',
            patients: result.rows,
            total: result.count,
            page: Number(page) || 1,
            limit: Number(limit) || 10,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server',
        }); 
    }
}


let handleGetStatisticalBooking = async (req, res) => {
    try {
        const data = await patientService.handleGetStatisticalBooking();
        return res.status(200).json({
            errCode: 0,
            data
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let handleGetPatientByClinic = async (req, res) =>{
    try {
        const data = await patientService.handleGetPatientByClinic(req.query);
        return res.status(200).json({
            errCode: 0,
            data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server',
        })
    }
}

module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment,
    handleGetAllBooking: handleGetAllBooking,
    handleGetAllBookedByPatient: handleGetAllBookedByPatient,
    handleSendEmailCancelBooked: handleSendEmailCancelBooked,
    handleVerifyCancelBooked: handleVerifyCancelBooked,
    handleGetAllPatient: handleGetAllPatient,
    handleGetStatisticalBooking: handleGetStatisticalBooking,
    handleGetPatientByClinic: handleGetPatientByClinic,

}