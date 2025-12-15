import doctorService from '../services/doctorService'


let getTopDoctorHome = async (req, res) =>{
    let limit = req.query.limit;
    if(!limit) limit = 12;   

    try {
        let response = await doctorService.getTopDoctorHome(+limit);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Error from server!"
        })
    }
}


let getAllDoctors = async (req, res) => {
  try {
    let { page, limit, sortBy, sortOrder, keyword, positionId } = req.query;

    let result = await doctorService.getAllDoctors({
      page,
      limit,
      sortBy,
      sortOrder,
      keyword,
      positionId,
    });

    return res.status(200).json({
      errCode: 0,
      errMessage: 'Ok',
      doctors: result.rows,
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

 
let postInfoDoctor = async (req, res) =>{
    try {
        let response = await doctorService.saveDetailInfoDoctor(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from the server!",
        })
    }
}

let getDetailDoctorById = async (req, res) =>{
    try {
        let info = await doctorService.getDetailDoctorByIdService(req.query.id);
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let bulkCreateSchedule = async (req, res) =>{
    try {
        let info = await doctorService.bulkCreateScheduleService(req.body);
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let getScheduleByDate = async (req, res) =>{
    try {
        let info = await doctorService.getScheduleByDateService(req.query.doctorId, req.query.date);
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}


let handleGetScheduleByDoctor = async (req, res) => {
    try {
        const { doctorId, page, limit, sortBy, sortOrder, timeType, date } =
        req.query;

        const result = await doctorService.handleGetScheduleByDoctor({
            doctorId,
            page,
            limit,
            sortBy,
            sortOrder,
            timeType,
            date,
        });

        return res.status(200).json({
            errCode: 0,
            errMessage: 'Ok',
            schedules: result.rows,
            total: result.count,
            page: Number(page) || 1,
            limit: Number(limit) || 10,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!',
        });
    }
};


let handleGetAllSchedule = async (req, res) => {
    try {
        let { page, limit, sortBy, sortOrder, timeType, date } = req.query;

        let info = await doctorService.handleGetAllSchedule({
            page,
            limit,
            sortBy,
            sortOrder,
            timeType,
            date,
        });

        return res.status(200).json({
            errCode: 0,
            errMessage: 'Ok',
            schedules: info.rows,
            total: info.count,
            page: Number(page) || 1,
            limit: Number(limit) || 10,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!',
        });
    }
};



let getExtraInfoDoctorById = async (req, res) =>{
    try {
        let info = await doctorService.getExtraInfoDoctorByIdService(req.query.doctorId);
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let getProfileDoctorById = async (req, res) =>{
    try {
        let info = await doctorService.getProfileDoctorByIdService(req.query.doctorId);
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let getListPatientForDoctor = async (req, res) =>{
    try {
        let info = await doctorService.getListPatientForDoctorService(req.query);
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}


let sendRemedy = async (req, res) =>{
    try {
        let info = await doctorService.SendRemedy(req.body);
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
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    postInfoDoctor: postInfoDoctor,
    getDetailDoctorById: getDetailDoctorById,
    bulkCreateSchedule: bulkCreateSchedule,
    getScheduleByDate: getScheduleByDate,
    getExtraInfoDoctorById: getExtraInfoDoctorById,
    getProfileDoctorById: getProfileDoctorById,
    getListPatientForDoctor: getListPatientForDoctor,
    sendRemedy: sendRemedy,
    handleGetAllSchedule: handleGetAllSchedule,
    handleGetScheduleByDoctor: handleGetScheduleByDoctor,
}