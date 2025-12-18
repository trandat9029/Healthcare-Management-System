import { raw } from "body-parser";
import db from "../models";
require('dotenv').config();
import emailService from './emailService'
const { v4: uuidv4 } = require('uuid');
import { Op, Sequelize } from 'sequelize';


let buildUrlEmail = (doctorId, token) =>{
    let result = `${process.env.FRONTEND_ORIGIN}/verify-booking?token=${token}&doctorId=${doctorId}`; 

    return result;
}

let buildUrlCancelEmail = (doctorId, token) => {
    return `${process.env.FRONTEND_ORIGIN}/verify-cancel-booking?token=${token}&doctorId=${doctorId}`;
};

let postBookAppointmentService = (data) => {
  return new Promise(async (resolve, reject) => {
    const t = await db.sequelize.transaction();
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.timeType ||
        !data.date ||
        !data.fullName ||
        !data.address ||
        !data.selectedGender
      ) {
        await t.rollback();
        return resolve({ errCode: 1, errMessage: "Missing required parameter!" });
      }

      const token = uuidv4();

      // 1) Tạo hoặc lấy User trước
      const [user] = await db.User.findOrCreate({
        where: { email: data.email },
        defaults: {
          email: data.email,
          roleId: "R3",
          gender: data.selectedGender,
          address: data.address,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
        },
        transaction: t,
      });

      // 2) Chống trùng lịch theo rule: patientId + doctorId + date + timeType
      // Nếu đã có booking trùng slot thì rollback và trả errCode=2
      const existed = await db.Booking.findOne({
        where: {
          patientId: user.id,
          doctorId: data.doctorId,
          date: data.date,
          timeType: data.timeType,
          statusId: { [Op.in]: ["S1", "S2"] }, // đang chờ hoặc đã xác nhận
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (existed) {
        await t.rollback();
        return resolve({ errCode: 2, errMessage: "Bạn đã đặt khung giờ này rồi." });
      }

      // 3) Gửi email sau khi chắc chắn không trùng
      await emailService.sendSimpleEmail({
        receiverEmail: data.email,
        language: data.language,
        redirectLink: buildUrlEmail(data.doctorId, token),

        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address,
        reason: data.reason,
        birthday: data.birthday,
        selectedGender: data.selectedGender,
        timeString: data.timeString,
        doctorName: data.doctorName,
        note: data.note,
        insuranceNumber: data.insuranceNumber,
      });

      // 4) Update User mỗi lần đặt lịch
      await db.User.update(
        {
          gender: data.selectedGender,
          address: data.address,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
        },
        { where: { id: user.id }, transaction: t }
      );

      // 5) Upsert Patient theo patientId = user.id
      await db.Patient.findOrCreate({
        where: { patientId: user.id },
        defaults: {
          patientId: user.id,
          birthday: data.birthday,
          reason: data.reason,
          note: data.note,
          insuranceNumber: data.insuranceNumber,
        },
        transaction: t,
      });

      await db.Patient.update(
        {
          birthday: data.birthday,
          reason: data.reason,
          note: data.note,
          insuranceNumber: data.insuranceNumber,
        },
        { where: { patientId: user.id }, transaction: t }
      );

      // 6) Tạo booking mới
      await db.Booking.create(
        {
          statusId: "S1",
          doctorId: data.doctorId,
          patientId: user.id,
          date: data.date,
          timeType: data.timeType,
          token,
        },
        { transaction: t }
      );

      await t.commit();
      return resolve({ errCode: 0, errMessage: "Save info patient succeed!" });
    } catch (error) {
      await t.rollback();

      // Nếu bạn đã tạo unique index ở DB (cách B), trùng lịch có thể văng lỗi UniqueConstraintError
      if (error && (error.name === "SequelizeUniqueConstraintError" || error.parent?.errno === 1062)) {
        return resolve({ errCode: 2, errMessage: "Bạn đã đặt khung giờ này rồi." });
      }

      reject(error);
    }
  });
};

let postVerifyBookAppointmentService = (data) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!data.token || !data.doctorId){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!',
                })
            }else{

                let appointment = await db.Booking.findOne({
                    where : {
                        doctorId : data.doctorId,
                        token: data.token,
                        statusId: 'S1' 
                    },
                    raw: false
                })

                if(appointment){
                    appointment.statusId = 'S2'
                    await appointment.save()

                    resolve({
                        errCode: 0,
                        errMessage: 'Update the appointment succeed!'
                    })
                }else{
                    resolve({
                        errCode: 2,
                        errMessage: 'Appointment has been activated or does not exist!'
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

let handleGetAllBooking = ({
    page,
    limit,
    sortBy,
    sortOrder,
    keywordDoctor,
    keywordPatient,
    timeType,
    date,
    statusId,
}) => {
    return new Promise(async (resolve, reject) => {
        try {
        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 10;
        const offset = (pageNumber - 1) * pageSize;

        const allowedSortField = {
            doctorId: 'doctorId',
            patientId: 'patientId',
            statusId: 'statusId',
            date: 'date',
            timeType: 'timeType',
            createdAt: 'createdAt',
        };

        const sortField = allowedSortField[sortBy] || 'createdAt';
        const sortDirection =
            String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // where cho bảng Booking
        const whereBooking = {};
        if (timeType) whereBooking.timeType = timeType;
        if (statusId) whereBooking.statusId = statusId;
        if (date) whereBooking.date = Number(date);

        const doctorKw = (keywordDoctor || '').trim();
        const patientKw = (keywordPatient || '').trim();

        const info = await db.Booking.findAndCountAll({
            where: whereBooking,
            include: [
            {
                model: db.User,
                as: 'patientData',
                attributes: ['firstName', 'lastName'],
                required: !!patientKw,
                where: patientKw
                ? {
                    [Op.or]: [
                        { firstName: { [Op.like]: `%${patientKw}%` } },
                        { lastName: { [Op.like]: `%${patientKw}%` } },
                    ],
                    }
                : undefined,
            },
            {
                model: db.User,
                as: 'doctorBookings',
                attributes: ['firstName', 'lastName', 'email'],
                required: !!doctorKw,
                where: doctorKw
                ? {
                    [Op.or]: [
                        { firstName: { [Op.like]: `%${doctorKw}%` } },
                        { lastName: { [Op.like]: `%${doctorKw}%` } },
                    ],
                    }
                : undefined,
            },
            {
                model: db.Allcode,
                as: 'timeTypeDataPatient',
                attributes: ['valueEn', 'valueVi'],
            },
            {
                model: db.Allcode,
                as: 'statusData',
                attributes: ['valueEn', 'valueVi'],
            },
            ],
            raw: false,
            nest: true,
            limit: pageSize,
            offset,
            order: [[sortField, sortDirection]],
            distinct: true,
        });

        resolve(info);
        } catch (error) {
        reject(error);
        }
    });
};

let handleGetAllBookedByPatient = ({ patientId, page, limit, sortBy, sortOrder }) => {
    return new Promise(async (resolve, reject) => {
        try {
        const offset = (page - 1) * limit;

        const order = [];
        if (sortBy) {
            order.push([
            sortBy,
            String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
            ]);
        } else {
            // mặc định mới nhất lên trước
            order.push(['createdAt', 'DESC']);
        }

        const result = await db.Booking.findAndCountAll({
            where: { patientId },
            limit,
            offset,
            order,
            include: [
            {
                model: db.User,
                as: 'doctorBookings',       // phải trùng alias trong model Booking
                attributes: ['id', 'firstName', 'lastName', 'image', 'positionId'],
                include: [
                {
                    model: db.Allcode,
                    as: 'positionData',
                    attributes: ['valueVi', 'valueEn'],
                },
                ],
            },
            {
                model: db.User,
                as: 'patientData',     
                attributes: ['id','email', 'firstName', 'lastName','address', 'phoneNumber'],
                
            },
            {
                model: db.Allcode,
                as: 'timeTypeDataPatient',
                attributes: ['valueVi', 'valueEn'],
            },
            {
                model: db.Allcode,
                as: 'statusData',
                attributes: ['valueVi', 'valueEn'],
            },
            ],
            distinct: true, // tránh count sai khi join nhiều bảng
            raw: false,
            nest: true,
        });

        resolve(result);
        } catch (error) {
        reject(error);
        }
    });
};

let handleSendEmailCancelBooked = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
        if (!data.email || !data.doctorId || !data.bookingId || !data.language) {
            return resolve({
            errCode: 1,
            errMessage: 'Missing required parameter!',
            });
        }

        let appointment = await db.Booking.findOne({
            where: {
            id: data.bookingId,
            doctorId: data.doctorId,
            statusId: {
                [Op.in]: ['S1', 'S2'],   // sửa ở đây
            },
            },
            raw: false,
        });

        if (!appointment) {
            return resolve({
            errCode: 2,
            errMessage: 'Appointment not found or cannot be cancelled!',
            });
        }

        const token = uuidv4();
        appointment.token = token;
        await appointment.save();

        await emailService.sendCancelEmail({
            receiverEmail: data.email,
            language: data.language,
            fullName: data.fullName,
            timeString: data.timeString,
            doctorName: data.doctorName,
            redirectLink: buildUrlCancelEmail(data.doctorId, token),
        });

        return resolve({
            errCode: 0,
            errMessage: 'Send cancel email succeed!',
        });
        } catch (error) {
        console.log(error);
        reject(error);
        }
    });
};

let handleVerifyCancelBooked = (data) => {
    return new Promise(async (resolve, reject) => {
        const t = await db.sequelize.transaction();
        try {
        if (!data.token || !data.doctorId) {
            await t.rollback();
            return resolve({
            errCode: 1,
            errMessage: "Missing required parameter!",
            });
        }

        // 1) Chỉ lấy booking còn có thể hủy (S1, S2)
        // lock để tránh 2 request cùng lúc
        const appointment = await db.Booking.findOne({
            where: {
                doctorId: data.doctorId,
                token: data.token,
                statusId: { [Op.in]: ["S1", "S2"] },
            },
            raw: false,
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!appointment) {
            await t.rollback();
            return resolve({
            errCode: 2,
            errMessage: "Appointment has been activated or does not exist!",
            });
        }

        // 2) Update trạng thái sang S4 (đã hủy)
        appointment.statusId = "S4";
        await appointment.save({ transaction: t });

        // 3) Lấy doctor_info để biết clinicId
        const doctorInfo = await db.Doctor_info.findOne({
            where: { doctorId: data.doctorId },
            transaction: t,
            raw: false, 
            lock: t.LOCK.UPDATE,
        });

        // 4) Cộng countCancel cho doctor_info và clinic
        if (doctorInfo) {
            // Doctor_info
            await doctorInfo.increment("countCancel", { by: 1, transaction: t });

            // Clinic
            if (doctorInfo.clinicId) {
            await db.Clinic.increment("countCancel", {
                by: 1,
                where: { id: doctorInfo.clinicId },
                transaction: t,
            });
            }
        }

        await t.commit();

        return resolve({
            errCode: 0,
            errMessage: "Update the appointment succeed!",
        });
        } catch (error) {
        await t.rollback();
        reject(error);
        }
    });
};

let handleGetAllPatient = ({ page, limit, sortBy, sortOrder, keyword }) => {
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

        const whereUser = { roleId: 'R3' };

        const kw = (keyword || '').trim();
        if (kw) {
            whereUser[Op.or] = [
            { firstName: { [Op.like]: `%${kw}%` } },
            { lastName: { [Op.like]: `%${kw}%` } },
            ];
        }

        const patients = await db.User.findAndCountAll({
            where: whereUser,
            attributes: { exclude: ['password', 'image'] },
            include: [
                { model: db.Allcode, as: 'roleData', attributes: ['valueVi', 'valueEn'] },
                { model: db.Patient, as: 'patientInfoData'},
            ],
            raw: true,
            nest: true,
            limit: pageSize,
            offset,
            order: [[sortField, sortDirection]],
            distinct: true,
        });

        resolve(patients);
        } catch (error) {
        reject(error);
        }
    });
};

let handleGetStatisticalBooking = async () => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(1);
    endDate.setHours(0, 0, 0, 0);

    const rows = await db.Booking.findAll({
        attributes: [
            [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%m/%Y'), 'month'],
            [Sequelize.literal(`SUM(statusId = 'S2')`), 'confirmed'],
            [Sequelize.literal(`SUM(statusId = 'S3')`), 'finished'],
            [Sequelize.literal(`SUM(statusId = 'S1')`), 'pending'],
            [Sequelize.literal(`SUM(statusId = 'S4')`), 'cancelled']
        ],
        where: {
            createdAt: {
                [Op.gte]: startDate,
                [Op.lt]: endDate
            }
        },
        group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m')],
        order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
        raw: true
    });

    return rows.map(item => ({
        month: item.month,
        confirmed: Number(item.confirmed || 0),
        finished: Number(item.finished || 0),
        pending: Number(item.pending || 0),
        cancelled: Number(item.cancelled || 0)
    }));
};

const getCurrentMonthRange = () => {
  const now = new Date();

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

  return {
    startMs: startOfThisMonth.getTime(),
    endMsExclusive: startOfNextMonth.getTime(),
  };
};

let handleGetPatientByClinic = async (query) => {
    const { clinicId } = query;

    const { startMs, endMsExclusive } = getCurrentMonthRange();
    const whereDoctorInfo = clinicId ? { clinicId: Number(clinicId) } : {};

    const data = await db.Booking.findAll({
        where: {
        date: { [Op.gte]: startMs, [Op.lt]: endMsExclusive },
        statusId: { [Op.in]: ["S3", "S4"] },
        },

        attributes: [
        [Sequelize.col("doctorBookings->doctorInfoData.clinicId"), "clinicId"],

        [
            Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.fn("FROM_UNIXTIME", Sequelize.literal("`Booking`.`date` / 1000")),
            "%m/%Y"
            ),
            "month",
        ],

        [
            Sequelize.fn(
            "SUM",
            Sequelize.literal("CASE WHEN `Booking`.`statusId` = 'S3' THEN 1 ELSE 0 END")
            ),
            "countComplete",
        ],

        [
            Sequelize.fn(
            "SUM",
            Sequelize.literal("CASE WHEN `Booking`.`statusId` = 'S4' THEN 1 ELSE 0 END")
            ),
            "countCancel",
        ],
        ],

        include: [
        {
            model: db.User,
            as: "doctorBookings",
            attributes: [],
            required: true,
            include: [
            {
                model: db.Doctor_info,
                as: "doctorInfoData",
                attributes: [],
                where: whereDoctorInfo,
                required: true,
            },
            ],
        },
        ],

        group: [Sequelize.col("doctorBookings->doctorInfoData.clinicId")],
        order: [[Sequelize.col("doctorBookings->doctorInfoData.clinicId"), "ASC"]],
        raw: true,
    });

    return data;
};

module.exports = {
    postBookAppointmentService: postBookAppointmentService,
    postVerifyBookAppointmentService: postVerifyBookAppointmentService,
    handleGetAllBooking: handleGetAllBooking,
    handleGetAllBookedByPatient: handleGetAllBookedByPatient,
    handleSendEmailCancelBooked: handleSendEmailCancelBooked,
    handleVerifyCancelBooked: handleVerifyCancelBooked,
    handleGetAllPatient:handleGetAllPatient,
    handleGetStatisticalBooking: handleGetStatisticalBooking,
    handleGetPatientByClinic: handleGetPatientByClinic,

}