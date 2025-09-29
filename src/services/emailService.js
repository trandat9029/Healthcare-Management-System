require('dotenv').config();
import nodemailer from 'nodemailer'
// const nodemailer = require("nodemailer")

// async function main() {
//     let transporter = nodemailer.createTransport({
//         host: "smtp.ethereal.email",
//         port: 587,
//         secure: false,
//         auth: {
//             user: createTestAccount.user,
//             user: createTestAccount.pass,
//         },

//     });

//     let info = await transporter.sendMail({
//         from: '"Fred Foo " <foo@example.com>',
//         to: "bar@example.com, baz@example.com",
//         subject: "hello",
//         text: "hello world",
//         html: "<b>Hello world</b>"
//     })
// }


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
        html: `
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
        `,
    })
}

module.exports = {
    sendSimpleEmail: sendSimpleEmail,

}