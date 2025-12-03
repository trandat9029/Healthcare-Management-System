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

let getAllClinic = async (req, res) => {
  try {
    let { page, limit, sortBy, sortOrder } = req.query;

    let info = await clinicService.getAllClinicService(
      page,
      limit,
      sortBy,
      sortOrder
    );

    return res.status(200).json(info);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server!',
    });
  }
};

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

let handleUpdateClinic = async (req, res) =>{
    try {
        let message =  await clinicService.handleUpdateClinic(req.body);
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
    createClinic: createClinic,
    getAllClinic: getAllClinic,
    getDetailClinicById: getDetailClinicById,
    handleUpdateClinic: handleUpdateClinic,
}