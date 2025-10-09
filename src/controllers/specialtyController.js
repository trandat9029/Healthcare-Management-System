import specialtyService from '../services/specialtyService'

let createSpecialty = async (req, res) =>{
    try {
            let info = await specialtyService.createSpecialtyService(req.body);
            return res.status(200).json(info);
        } catch (error) {
            console.log(error);
            return res.status(200).json({
                errCode: -1,
                errMessage: 'Error from the server!'
            })
        }

    }
let getAllSpecialty = async (req, res) =>{
    try {
        let info = await specialtyService.getAllSpecialtyService();
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let getDetailSpecialtyById = async (req, res) =>{
    try {
        let info = await specialtyService.getDetailSpecialtyByIdService(req.query.id, req.query.location);
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
    createSpecialty: createSpecialty,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialtyById: getDetailSpecialtyById,

}