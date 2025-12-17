import db from "../models";
import emailService from "./emailService"
require('dotenv').config();
import _, { reject } from "lodash";
const { Op, fn, col, where: sequelizeWhere } = db.Sequelize;

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: { roleId: 'R2' },
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ['password'],
                    },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Doctor_info, as: 'doctorInfoData' },  
                ],
                raw: true,
                nest: true,
            });

            if (users && users.length > 0) {
                users = users.map((item) => {
                if (item.image) {
                    item.image = Buffer.from(item.image, 'base64').toString('binary');
                }
                return item;
                });
            }

            resolve({
                errCode: 0,
                data: users,
            });
        } catch (error) {
            reject(error);
        }
    });
};


let getAllDoctors = ({ page, limit, sortBy, sortOrder, keyword, positionId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pageNumber = Number(page) || 1;
            const pageSize = Number(limit) || 10;
            const offset = (pageNumber - 1) * pageSize;

            const allowedSortField = {
                email: 'email',
                firstName: 'firstName',
                lastName: 'lastName',
                createdAt: 'createdAt',
            };

            const sortField = allowedSortField[sortBy] || 'createdAt';
            const sortDirection =
                String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            const whereUser = { roleId: 'R2' };

            if (positionId) whereUser.positionId = positionId;

            const kw = (keyword || '').trim();
            if (kw) {
                whereUser[Op.or] = [
                { firstName: { [Op.like]: `%${kw}%` } },
                { lastName: { [Op.like]: `%${kw}%` } },
                ];
            }

            const doctors = await db.User.findAndCountAll({
                where: whereUser,
                attributes: { exclude: ['password'] },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueVi', 'valueEn'] },
                    { model: db.Allcode, as: 'roleData', attributes: ['valueVi', 'valueEn'] },
                ],
                raw: true,
                nest: true,
                limit: pageSize,
                offset,
                order: [[sortField, sortDirection]],
                distinct: true,
            });
            if (doctors.rows && doctors.rows.length > 0) {
            doctors.rows = doctors.rows.map(item => {
                if (item.image) {
                item.image = Buffer.from(item.image, 'base64').toString('binary');
                }
                return item;
            });
            }
            resolve(doctors);
        } catch (error) {
        reject(error);
        }
    });
};


let checkRequiredFields = (inputData) =>{
    let arrFields = ['doctorId', 'contentHTML', 'contentMarkdown', 'action', 'selectedPrice', 'selectedPayment', 'selectedProvince', 'dateOfBirth',  'note', 'specialtyId'];
    
    let isValid = true;
    let element = '';
    for(let i =0; i < arrFields.length; i++){
        if(!inputData[arrFields[i]]){
            isValid = false;
            element = arrFields[i];
            break;
        }
    }

    return {
        isValid: isValid,
        element: element,
    }
}


let saveDetailInfoDoctor = (inputData) =>{
    return new Promise( async (resolve, reject) => {
        try {
            let checkObj = checkRequiredFields(inputData);

            if(checkObj.isValid === false){
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter: ${checkObj.element} `
                })
            }else{

                //upsert to markdown table
                if(inputData.action === 'CREATE'){
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId,
                    
                    })
                }else if(inputData.action === 'EDIT'){
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false
                    })

                    if(doctorMarkdown){
                        doctorMarkdown.contentHTML = inputData.contentHTML;
                        doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
                        doctorMarkdown.description = inputData.description;

                        await doctorMarkdown.save()
                    }
                }

                //upsert to doctor_info table
                let doctorInfo = await db.Doctor_info.findOne({
                    where: {
                        doctorId: inputData.doctorId,
                    },
                    raw: false
                })
                if(doctorInfo){
                    //update
                    doctorInfo.doctorId = inputData.doctorId;
                    doctorInfo.priceId = inputData.selectedPrice;
                    doctorInfo.paymentId = inputData.selectedPayment;
                    doctorInfo.provinceId = inputData.selectedProvince;
                    doctorInfo.dateOfBirth = inputData.dateOfBirth;
                    doctorInfo.note = inputData.note;
                    doctorInfo.specialtyId = inputData.specialtyId;
                    doctorInfo.clinicId = inputData.clinicId;

                    await doctorInfo.save()

                }else{
                    //create
                    await db.Doctor_info.create({
                        doctorId: inputData.doctorId,
                        priceId: inputData.selectedPrice,
                        paymentId: inputData.selectedPayment,
                        provinceId: inputData.selectedProvince,
                        dateOfBirth: inputData.dateOfBirth,
                        note: inputData.note,
                        specialtyId: inputData.specialtyId,
                        clinicId: inputData.clinicId,
                    
                    })
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Save info doctor succeed!'
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

const checkRequiredFieldProfile = (inputData) => {
  const required = [
    "doctorId",
    "firstName",
    "lastName",
    "address",
    "phoneNumber",

    "contentHTML",
    "contentMarkdown",
    "description",

    "selectedPrice",
    "selectedPayment",
    "selectedProvince",

    "dateOfBirth",

    "selectedSpecialty",
    "selectedClinic",
  ];

  for (let i = 0; i < required.length; i++) {
    const key = required[i];
    if (
      typeof inputData[key] === "undefined" ||
      inputData[key] === null ||
      inputData[key] === ""
    ) {
      return { isValid: false, element: key };
    }
  }
  return { isValid: true };
};

let handleUpdateProfile = (inputData) => {
  return new Promise(async (resolve, reject) => {
    const t = await db.sequelize.transaction();
    try {
      const checkObj = checkRequiredFieldProfile(inputData);
      if (checkObj.isValid === false) {
        await t.rollback();
        return resolve({
          errCode: 1,
          errMessage: `Missing parameter: ${checkObj.element}`,
        });
      }

      const doctorId = Number(inputData.doctorId);

      // 1) UPDATE USER (Sequelize instance)
      const user = await db.User.findOne({
        where: { id: doctorId },
        raw: false,
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!user) {
        await t.rollback();
        return resolve({
          errCode: 2,
          errMessage: "Doctor not found!",
        });
      }

      user.firstName = inputData.firstName;
      user.lastName = inputData.lastName;
      user.address = inputData.address;
      user.phoneNumber = inputData.phoneNumber;

      if (typeof inputData.image !== "undefined") user.image = inputData.image;
      if (inputData.gender) user.gender = inputData.gender;
      if (inputData.positionId) user.positionId = inputData.positionId;

      await user.save({ transaction: t });

      // 2) UPSERT MARKDOWN
      const markdownPayload = {
        doctorId,
        contentHTML: inputData.contentHTML,
        contentMarkdown: inputData.contentMarkdown,
        description: inputData.description,
        specialtyId: Number(inputData.selectedSpecialty),
        clinicId: Number(inputData.selectedClinic),
      };

      const doctorMarkdown = await db.Markdown.findOne({
        where: { doctorId },
        raw: false,
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (doctorMarkdown) {
        doctorMarkdown.contentHTML = markdownPayload.contentHTML;
        doctorMarkdown.contentMarkdown = markdownPayload.contentMarkdown;
        doctorMarkdown.description = markdownPayload.description;
        doctorMarkdown.specialtyId = markdownPayload.specialtyId;
        doctorMarkdown.clinicId = markdownPayload.clinicId;

        await doctorMarkdown.save({ transaction: t });
      } else {
        await db.Markdown.create(markdownPayload, { transaction: t });
      }

      // 3) UPSERT DOCTOR_INFO
      const doctorInfoPayload = {
        doctorId,
        priceId: inputData.selectedPrice,
        paymentId: inputData.selectedPayment,
        provinceId: inputData.selectedProvince,
        nameClinic: inputData.nameClinic,
        addressClinic: inputData.addressClinic,
        note: inputData.note || "",
        specialtyId: Number(inputData.selectedSpecialty),
        clinicId: Number(inputData.selectedClinic),
      };

      const doctorInfo = await db.Doctor_info.findOne({
        where: { doctorId },
        raw: false,
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (doctorInfo) {
        doctorInfo.priceId = doctorInfoPayload.priceId;
        doctorInfo.paymentId = doctorInfoPayload.paymentId;
        doctorInfo.provinceId = doctorInfoPayload.provinceId;
        doctorInfo.nameClinic = doctorInfoPayload.nameClinic;
        doctorInfo.addressClinic = doctorInfoPayload.addressClinic;
        doctorInfo.note = doctorInfoPayload.note;
        doctorInfo.specialtyId = doctorInfoPayload.specialtyId;
        doctorInfo.clinicId = doctorInfoPayload.clinicId;

        await doctorInfo.save({ transaction: t });
      } else {
        await db.Doctor_info.create(doctorInfoPayload, { transaction: t });
      }

      await t.commit();
      return resolve({
        errCode: 0,
        errMessage: "Update profile succeed!",
      });
    } catch (error) {
      await t.rollback();
      return reject(error);
    }
  });
};


let getDetailDoctorByIdService = (inputId) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!inputId) {
                resolve({
                    errCode: -1,
                    errMessage: 'Missing required parameter!'
                })
            }else{
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes: {
                        exclude: ['password'],
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown'],
                        },
                        {
                            model: db.Allcode,
                            as: 'positionData',
                            attributes: ['valueEn', 'valueVi'],
                        },
                        {
                            model: db.Allcode,
                            as: 'genderData',
                            attributes: ['valueEn', 'valueVi'],
                        },
                        {
                            model: db.Doctor_info,
                            as: 'doctorInfoData',                // thêm alias ở đây
                            attributes: [
                                'priceId',
                                'paymentId',
                                'provinceId',
                                'specialtyId',
                                'clinicId',
                                'dateOfBirth',
                                'countComplete',
                                'note',
                                'countCancel',
                            ],
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                            ],
                        },
                    ],
                    raw: false,
                    nest: true,
                });
                if(data && data.image ){
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }

                if(!data) data = {};

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}


let bulkCreateScheduleService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
        if (!data.arrSchedule || !data.doctorId || !data.formatedDate) {
            resolve({ errCode: 1, errMessage: 'Missing required parameter!' });
            return;
        }

        let schedule = data.arrSchedule || [];
        schedule = schedule.map((item) => ({
            ...item,
            maxNumber: MAX_NUMBER_SCHEDULE,
        }));

        // lấy existing (cần id để xóa)
        const existing = await db.Schedule.findAll({
            where: { doctorId: data.doctorId, date: data.formatedDate },
            attributes: ['id', 'timeType', 'date', 'doctorId'],
            raw: true,
        });

        const newTimeTypes = new Set(schedule.map((s) => s.timeType));
        const oldTimeTypes = new Set(existing.map((e) => e.timeType));

        const toCreate = schedule.filter((s) => !oldTimeTypes.has(s.timeType));
        const toDeleteIds = existing
            .filter((e) => !newTimeTypes.has(e.timeType))
            .map((e) => e.id);

        await db.sequelize.transaction(async (t) => {
            if (toDeleteIds.length > 0) {
            await db.Schedule.destroy({
                where: { id: toDeleteIds },
                transaction: t,
            });
            }
            if (toCreate.length > 0) {
            await db.Schedule.bulkCreate(toCreate, { transaction: t });
            }
        });

        resolve({ errCode: 0, errMessage: 'OK' });
        } catch (error) {
        reject(error);
        }
    });
};


let getScheduleByDateService = (doctorId, date) =>{
    return new Promise(async (resolve, reject) => {
        try {
            if(!doctorId || !date){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                let dataSchedule = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date,
                    },
                    include: [
                        { 
                            model: db.Allcode, as: 'timeTypeData', attributes: ['valueVi', 'valueEn']
                        },

                        { 
                            model: db.User, as: 'doctorData', attributes: ['firstName', 'lastName']
                        },
                    ],
                    raw: false,
                    nest: true
                })

                if(!dataSchedule) dataSchedule = [];

                resolve({
                    errCode: 0,
                    data: dataSchedule,
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}


let handleGetAllSchedule = ({
    page,
    limit,
    sortBy,
    sortOrder,
    timeType,
    date,
}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pageNumber = Number(page) || 1;
            const pageSize = Number(limit) || 10;
            const offset = (pageNumber - 1) * pageSize;

            const allowedSortField = {
                date: 'date',
                timeType: 'timeType',
                doctorId: 'doctorId',
                createdAt: 'createdAt',
            };

            const sortField = allowedSortField[sortBy] || 'createdAt';
            const sortDirection =
                String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            const whereSchedule = {};
            if (timeType) {
                whereSchedule.timeType = timeType;
            }
            if (date) {
                whereSchedule.date = Number(date);
            }

            const info = await db.Schedule.findAndCountAll({
                where: whereSchedule,
                include: [
                    {
                        model: db.Allcode,
                        as: 'timeTypeData',
                        attributes: ['valueVi', 'valueEn'],
                    },
                    {
                        model: db.User,
                        as: 'doctorData',
                        attributes: ['firstName', 'lastName'],
                    },
                ],
                limit: pageSize,
                offset,
                order: [[sortField, sortDirection]],
                raw: false,
                nest: true,
                distinct: true,
            });

            resolve(info);
        } catch (error) {
            reject(error);
        }
    });
};


let handleGetScheduleByDoctor = ({
    doctorId,
    page,
    limit,
    sortBy,
    sortOrder,
    timeType,
    date,
}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pageNumber = Number(page) || 1;
            const pageSize = Number(limit) || 10;
            const offset = (pageNumber - 1) * pageSize;

            const allowedSortField = {
                date: 'date',
                timeType: 'timeType',
                doctorId: 'doctorId',
                createdAt: 'createdAt',
            };

            const sortField = allowedSortField[sortBy] || 'createdAt';
            const sortDirection =
                String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            const whereSchedule = {
                doctorId,
            };

            if (timeType) {
                whereSchedule.timeType = timeType;
            }
            if (date) {
                whereSchedule.date = Number(date);
            }

            const info = await db.Schedule.findAndCountAll({
                where: whereSchedule,
                include: [
                    {
                        model: db.Allcode,
                        as: 'timeTypeData',
                        attributes: ['valueVi', 'valueEn'],
                    },
                    {
                        model: db.User,
                        as: 'doctorData',
                        attributes: ['firstName', 'lastName'],
                    },
                ],
                limit: pageSize,
                offset,
                order: [[sortField, sortDirection]],
                raw: false,
                nest: true,
                distinct: true,
            });

            resolve(info);
        } catch (error) {
            reject(error);
        }
    });
};


let getExtraInfoDoctorByIdService = (doctorId) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!doctorId){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{
                let data = await db.Doctor_info.findOne({
                    where: {
                        doctorId: doctorId
                    },
                    attributes: {
                        exclude: ['id', 'doctorId']
                    },
                    include: [
                        {model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi']},
                        {model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi']},
                        {model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi']},
                    ],
                    raw: false,
                    nest: true
                })
                if(!data) data = {};
                resolve({
                    errCode: 0,
                    data: data,
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}


let getProfileDoctorByIdService = (inputId) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!inputId){
                resolve({
                errCode: 1,
                errMessage: 'Missing required parameter!',
                })
            }else{
                let data = await db.User.findOne({
                where: { id: inputId },
                attributes:{
                    exclude: ['password']
                },
                include: [
                    { 
                        model: db.Markdown,  
                        attributes: ['description', 'contentHTML', 'contentMarkdown']
                    },
                    { 
                        model: db.Allcode,
                        as: 'positionData',
                        attributes: ['valueEn', 'valueVi']
                    },
                    { 
                        model: db.Doctor_info,
                        as: 'doctorInfoData',                 // thêm alias cho đúng
                        attributes: [
                            'priceId',
                            'paymentId',
                            'provinceId',
                            'dateOfBirth',
                            'countComplete',
                            'note',
                            'countCancel',
                        ],
                        include: [
                            { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                            { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                            { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                        ]
                    },
                ],
                raw: false,
                nest: true
                })

                if(data && data.image ){
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }

                if(!data) data = {};

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (error) {
        reject(error)
        }
    })
}


let getListPatientForDoctorService = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { doctorId, date, timeType, statusId, keyword } = query;

      if (!doctorId || !date) {
        resolve({ errCode: 1, errMessage: "Missing required parameter!" });
        return;
      }

      const whereBooking = { doctorId, date };
      if (timeType) whereBooking.timeType = timeType;
      if (statusId) whereBooking.statusId = statusId;

      // keyword filter
      const wherePatient = {};
      const kwRaw = (keyword || "").trim().replace(/\s+/g, " "); // gộp nhiều space

      if (kwRaw) {
        const kwLike = `%${kwRaw}%`;
        const parts = kwRaw.split(" ");

        // Điều kiện match fullName theo 2 chiều:
        // 1) lastName firstName
        // 2) firstName lastName
        const fullNameOr = [
          sequelizeWhere(fn("concat", col("patientData.lastName"), " ", col("patientData.firstName")), {
            [Op.like]: kwLike,
          }),
          sequelizeWhere(fn("concat", col("patientData.firstName"), " ", col("patientData.lastName")), {
            [Op.like]: kwLike,
          }),
        ];

        // Điều kiện match từng token trên firstName/lastName
        const tokenAnd = parts.map((p) => {
          const likeP = `%${p}%`;
          return {
            [Op.or]: [
              { firstName: { [Op.like]: likeP } },
              { lastName: { [Op.like]: likeP } },
            ],
          };
        });

        wherePatient[Op.and] = [
          {
            [Op.or]: [
              ...fullNameOr,
              // nếu muốn mở rộng: tìm cả email, phone luôn
              { email: { [Op.like]: kwLike } },
              { phoneNumber: { [Op.like]: kwLike } },
            ],
          },
          ...tokenAnd,
        ];
      }

      let data = await db.Booking.findAll({
        where: whereBooking,
        include: [
          {
            model: db.User,
            as: "patientData",
            attributes: ["email", "firstName", "lastName", "address", "gender", "phoneNumber"],
            where: kwRaw ? wherePatient : undefined,
            required: kwRaw ? true : false,
            include: [
              { model: db.Allcode, as: "genderData", attributes: ["valueEn", "valueVi"] },
              { model: db.Patient, as: "patientInfoData", attributes: ["patientId", "birthday", "note", "reason", "insuranceNumber"] },
            ],
          },
          { model: db.Allcode, as: "timeTypeDataPatient", attributes: ["valueEn", "valueVi"] },
          { model: db.Allcode, as: "statusData", attributes: ["valueEn", "valueVi"] },
        ],
        raw: false,
        nest: true,
      });

      resolve({ errCode: 0, data });
    } catch (error) {
      reject(error);
    }
  });
};


let SendRemedy = (data) => {
    return new Promise(async (resolve, reject) => {
        const t = await db.sequelize.transaction();
        try {
            if (!data.email || !data.doctorId || !data.patientId || !data.timeType) {
                await t.rollback();
                return resolve({ errCode: 1, errMessage: "Missing required parameter!" });
            }

            // 1) Lấy đúng lịch hẹn đang ở S2
            const appointment = await db.Booking.findOne({
                where: {
                    doctorId: data.doctorId,
                    patientId: data.patientId,
                    timeType: data.timeType,
                    statusId: "S2",
                },
                raw: false,  
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            // Nếu không còn S2, nghĩa là đã xử lý rồi hoặc không tồn tại
            if (!appointment) {
                await t.rollback();
                // có thể coi là OK để tránh user bấm lại bị lỗi
                return resolve({ errCode: 0, errMessage: "Already finished or not found" });
            }

            // 2) Update status sang S3
            appointment.statusId = "S3";
            await appointment.save({ transaction: t });

            // 3) Tìm doctor_info để biết clinicId
            const doctorInfo = await db.Doctor_info.findOne({
                where: { doctorId: data.doctorId },
                raw: false,
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            // 4) Tăng count
            if (doctorInfo) {
                await doctorInfo.increment("countComplete", { by: 1, transaction: t });

                if (doctorInfo.clinicId) {
                await db.Clinic.increment("countComplete", {
                    by: 1,
                    where: { id: doctorInfo.clinicId },

                    transaction: t,
                });
                }

                // Nếu bạn có bảng Specialty thì làm tương tự:
                // await db.Specialty.increment("count", { by: 1, where: { id: doctorInfo.specialtyId }, transaction: t });
            }

            await t.commit();

            // 5) Send email sau commit cũng được. Nếu email fail thì count vẫn đúng
            await emailService.sendAttachment(data);

            resolve({ errCode: 0, errMessage: "Ok" });
        } catch (error) {
        await t.rollback();
        reject(error);
        }
    });
    };

module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    saveDetailInfoDoctor: saveDetailInfoDoctor,
    getDetailDoctorByIdService: getDetailDoctorByIdService,
    bulkCreateScheduleService: bulkCreateScheduleService,
    getScheduleByDateService: getScheduleByDateService,
    getExtraInfoDoctorByIdService: getExtraInfoDoctorByIdService,
    getProfileDoctorByIdService: getProfileDoctorByIdService,
    getListPatientForDoctorService: getListPatientForDoctorService,
    SendRemedy: SendRemedy,
    handleGetAllSchedule: handleGetAllSchedule,
    handleGetScheduleByDoctor: handleGetScheduleByDoctor,
    handleUpdateProfile: handleUpdateProfile,

}