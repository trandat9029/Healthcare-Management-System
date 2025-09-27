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

module.exports = {
    postBookAppointment: postBookAppointment,
}