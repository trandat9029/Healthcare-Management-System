require('dotenv').config();
import nodemailer from 'nodemailer'
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
        from: '"Onizuka " <tranledatvp@gmail.com>',
        to: dataSend.receiverEmail,
        subject: "Thông tin đặt lịch khám bệnh",
        html: getBodyHTMLEmail(dataSend),
    })
}


let getBodyHTMLEmail = (dataSend) =>{
    let result = '';

    if(dataSend.language === 'vi'){
        result = `
            <h3>Xin chào ${dataSend.patientName}!</h3> 
            <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên Booking Health</p>
            <p>Thông tin đặt lịch khám bệnh: </p>
            <div><b>Thời gian: ${dataSend.time}</b></div>
            <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>
            
            <p>Nếu các thông tin trên đúng với thông tin mà bạn đã đặt, vui long click vào đường link dưới đây để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh. </p>
            <div>
                <a href=${dataSend.redirectLink} target="_blank">Click here</a>
            </div>
            <div>Xin chân thành cảm ơn</div>
        `
    }
    if(dataSend.language === 'en'){
        result = `
            <h3>Hello ${dataSend.patientName}!</h3>
            <p>You are receiving this email because you have booked an online medical appointment on Booking Health.</p>
            <p>Medical appointment information:</p>
            <div><b>Time: ${dataSend.time}</b></div>
            <div><b>Doctor: ${dataSend.doctorName}</b></div>

            <p>If the information above is correct, please click the link below to confirm and complete the appointment booking process.</p>
            <div>
                <a href=${dataSend.redirectLink} target="_blank">Click here</a>
            </div>
            <div>Thank you sincerely!</div>
        `
    }

    return result;
}

module.exports = {
    sendSimpleEmail: sendSimpleEmail,

}