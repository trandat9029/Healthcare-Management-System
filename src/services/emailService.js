require('dotenv').config();
import nodemailer from 'nodemailer'
import moment from 'moment';
// const nodemailer = require("nodemailer")


let sendSimpleEmail = async (dataSend) =>{
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },

    });

    let info = await transporter.sendMail({
        from: '"BookingHealth " <tranledatvp@gmail.com>',
        to: dataSend.receiverEmail,
        subject: "Thông tin đặt lịch khám bệnh",
        html: getBodyHTMLEmail(dataSend),
    })
}


let getBodyHTMLEmail = (dataSend) => {
    let isVi = dataSend.language === 'vi';

    // dùng time hoặc timeString
    const timeText = dataSend.time || dataSend.timeString || '';

    // giá khám, nếu không truyền thì để chuỗi rỗng
    const priceText = dataSend.price || dataSend.priceString || '';

    // format giới tính
    const genderViMap = { M: 'Nam', F: 'Nữ', O: 'Khác' };
    const genderEnMap = { M: 'Male', F: 'Female', O: 'Other' };
    const genderText = isVi
        ? genderViMap[dataSend.selectedGender] || ''
        : genderEnMap[dataSend.selectedGender] || '';

    // format ngày sinh
    const birthdayFormatted = dataSend.birthday
        ? moment(dataSend.birthday).format(isVi ? 'DD/MM/YYYY' : 'MM/DD/YYYY')
        : '';

    if (isVi) {
        return `
            <h3>Xin chào ${dataSend.fullName}!</h3>
            <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên Booking Health.</p>

            <p><b>Thông tin lịch khám</b></p>
            <ul>
                <li><b>Thời gian</b>: ${timeText}</li>
                <li><b>Bác sĩ</b>: ${dataSend.doctorName}</li>
                <li><b>Giới tính</b>: ${genderText}</li>
                <li><b>Ngày sinh</b>: ${birthdayFormatted}</li>
                <li><b>Số điện thoại</b>: ${dataSend.phoneNumber}</li>
                <li><b>Email</b>: ${dataSend.email}</li>
                <li><b>Địa chỉ liên lạc</b>: ${dataSend.address}</li>
                <li><b>Mã thẻ bảo hiểm y tế</b>: ${dataSend.insuranceNumber || ''}</li>
                <li><b>Lý do khám</b>: ${dataSend.reason}</li>
                <li><b>Ghi chú cho bác sĩ</b>: ${dataSend.note || ''}</li>
            </ul>

            <p>Nếu các thông tin trên là chính xác. bạn vui lòng nhấn vào nút dưới đây để xác nhận lịch khám.</p>
            <p>
                <a href="${dataSend.redirectLink}"
                   target="_blank"
                   style="display:inline-block;padding:8px 16px;background-color:#10b981;color:#ffffff;text-decoration:none;border-radius:4px;">
                    Xác nhận lịch khám
                </a>
            </p>
            <p>Xin chân thành cảm ơn.</p>
        `;
    }

    return `
        <h3>Hello ${dataSend.fullName}!</h3>
        <p>You receive this email because you booked an online medical appointment on Booking Health.</p>

        <p><b>Appointment details</b></p>
        <ul>
            <li><b>Time</b>: ${timeText}</li>
            <li><b>Doctor</b>: ${dataSend.doctorName}</li>
            <li><b>Gender</b>: ${genderText}</li>
            <li><b>Date of birth</b>: ${birthdayFormatted}</li>
            <li><b>Phone number</b>: ${dataSend.phoneNumber}</li>
            <li><b>Email</b>: ${dataSend.email}</li>
            <li><b>Address</b>: ${dataSend.address}</li>
            <li><b>Insurance number</b>: ${dataSend.insuranceNumber || ''}</li>
            <li><b>Reason for visit</b>: ${dataSend.reason}</li>
            <li><b>Note for doctor</b>: ${dataSend.note || ''}</li>
        </ul>

        <p>If all the information above is correct. please click the button below to confirm your appointment.</p>
        <p>
            <a href="${dataSend.redirectLink}"
               target="_blank"
               style="display:inline-block;padding:8px 16px;background-color:#10b981;color:#ffffff;text-decoration:none;border-radius:4px;">
                Confirm appointment
            </a>
        </p>
        <p>Thank you.</p>
    `;
};



let getBodyHTMLEmailRemedy = (dataSend) =>{
    let result = '';

    if(dataSend.language === 'vi'){
        result = `
            <h3>Xin chào ${dataSend.patientName}!</h3> 
            <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên Booking Health và đã hoàn thành khám bệnh </p>
            <p>Thông tin đơn thuốc/hóa đơn được gửi trong file đính kèm </p>
            
            <div>Xin chân thành cảm ơn</div>
        `
    }
    if(dataSend.language === 'en'){
        result = `
            <h3>Hello ${dataSend.patientName}!</h3>
            <p>You are receiving this email because you have booked an online medical appointment on Booking Health.</p>
            <p>Medical appointment information:</p>
            
            
            <div>Thank you sincerely!</div>
        `
    }

    return result;
}

let sendAttachment = async (dataSend) =>{
    return new Promise( async (resolve, reject) =>{

        try {
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_APP,
                    pass: process.env.EMAIL_APP_PASSWORD,
                },

            });

            let info = await transporter.sendMail({
                from: '"Onizuka " <tranledatvp@gmail.com>',
                to: dataSend.email,
                subject: "Kết quả đặt lịch khám bệnh",
                html: getBodyHTMLEmailRemedy(dataSend),
                attachments: [
                    {
                        filename: `remedy-${dataSend.patientId}-${new Date().getTime()}.png`,
                        content: dataSend.imgBase64.split("base64,")[1],
                        encoding: 'base64'
                    }
                ],
            })
            resolve();
        } catch (error) {
            reject(error);
        }
    }) 
}



// nội dung email xác nhận hủy lịch
let getBodyHTMLEmailCancel = (dataSend) => {
  let isVi = dataSend.language === 'vi';

  if (isVi) {
    return `
      <h3>Xin chào ${dataSend.fullName}!</h3>
      <p>Bạn nhận được email này vì đã yêu cầu hủy lịch khám bệnh trên Booking Health.</p>

      <p><b>Thông tin lịch khám bạn muốn hủy</b></p>
      <ul>
        <li><b>Thời gian</b>: ${dataSend.timeString || ''}</li>
        <li><b>Bác sĩ</b>: ${dataSend.doctorName || ''}</li>
      </ul>

      <p>Nếu bạn chắc chắn muốn hủy lịch khám này. vui lòng nhấn vào nút dưới đây để xác nhận hủy.</p>
      <p>
        <a href="${dataSend.redirectLink}"
           target="_blank"
           style="display:inline-block;padding:8px 16px;background-color:#ef4444;color:#ffffff;text-decoration:none;border-radius:4px;">
          Xác nhận hủy lịch khám
        </a>
      </p>
      <p>Nếu đây không phải là yêu cầu của bạn. bạn có thể bỏ qua email này.</p>
      <p>Xin chân thành cảm ơn.</p>
    `;
  }

  return `
    <h3>Hello ${dataSend.fullName}!</h3>
    <p>You receive this email because you requested to cancel a medical appointment on Booking Health.</p>

    <p><b>Appointment you want to cancel</b></p>
    <ul>
      <li><b>Time</b>: ${dataSend.timeString || ''}</li>
      <li><b>Doctor</b>: ${dataSend.doctorName || ''}</li>
    </ul>

    <p>If you are sure you want to cancel this appointment. please click the button below to confirm the cancellation.</p>
    <p>
      <a href="${dataSend.redirectLink}"
         target="_blank"
         style="display:inline-block;padding:8px 16px;background-color:#ef4444;color:#ffffff;text-decoration:none;border-radius:4px;">
        Confirm cancellation
      </a>
    </p>
    <p>If this was not your request. you can ignore this email.</p>
    <p>Thank you.</p>
  `;
};

// gửi email xác nhận hủy lịch
let sendCancelEmail = async (dataSend) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: '"BookingHealth " <tranledatvp@gmail.com>',
    to: dataSend.receiverEmail,
    subject:
      dataSend.language === 'vi'
        ? 'Xác nhận hủy lịch khám bệnh'
        : 'Confirm appointment cancellation',
    html: getBodyHTMLEmailCancel(dataSend),
  });
};


let sendOtpEmail = async (receiverEmail, otp) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const html = `
    <h3>BookingHealth. Mã OTP đặt lại mật khẩu</h3>
    <p>Mã OTP của bạn là: <b style="font-size:18px">${otp}</b></p>
    <p>Mã có hiệu lực trong 5 phút.</p>
    <p>Nếu bạn không yêu cầu. vui lòng bỏ qua email này.</p>
  `;

  await transporter.sendMail({
    from: '"BookingHealth" <tranledatvp@gmail.com>',
    to: receiverEmail,
    subject: "OTP đặt lại mật khẩu",
    html,
  });
};


module.exports = {
    sendSimpleEmail: sendSimpleEmail,
    sendAttachment: sendAttachment,
    sendCancelEmail: sendCancelEmail,
    sendOtpEmail: sendOtpEmail
}