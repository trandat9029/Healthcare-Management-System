import patientService from '../services/patientService'


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
        let { page, limit, sortBy, sortOrder } = req.query;

        let result = await patientService.handleGetAllBooking({
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

module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment,
    handleGetAllBooking: handleGetAllBooking
}