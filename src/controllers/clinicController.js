import clinicService from '../services/clinicService';

let createClinic = async (req, res) =>{
    try {
        let info = await clinicService.createClinicService(req.body);
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let getAllClinic = async (req, res) =>{
    try {
        let info = await clinicService.getAllClinicService();
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let getDetailClinicById = async (req, res) =>{
    try {
        let info = await clinicService.getDetailClinicByIdService(req.query.id);
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
    createClinic: createClinic,
    getAllClinic: getAllClinic,
    getDetailClinicById: getDetailClinicById,
}