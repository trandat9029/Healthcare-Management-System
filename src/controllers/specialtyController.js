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

let getAllSpecialty = async (req, res) => {
    try {
        let { page, limit, sortBy, sortOrder, keyword } = req.query;

        let info = await specialtyService.getAllSpecialtyService({
            page,
            limit,
            sortBy: sortBy || 'name',
            sortOrder: sortOrder || 'ASC',
            keyword,
        });

        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server!',
        });
    }
};

let getDetailSpecialtyById = async (req, res) =>{
    try {
        let info = await specialtyService.getDetailSpecialtyByIdService(req.query.id, req.query.location);
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let handleUpdateSpecialty = async (req, res) =>{
    try {
        let message =  await specialtyService.handleUpdateSpecialty(req.body);
        return res.status(200).json(message);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let handleDeleteSpecialty = async (req, res) =>{
    try {
        let message =  await specialtyService.handleDeleteSpecialty(req.body.id);
        return res.status(200).json(message);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }  
}

module.exports = {
    createSpecialty: createSpecialty,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialtyById: getDetailSpecialtyById,
    handleUpdateSpecialty: handleUpdateSpecialty,
    handleDeleteSpecialty: handleDeleteSpecialty,

}