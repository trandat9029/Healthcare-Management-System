import { Op, where } from "sequelize";
import db from "../models";
import bcrypt from "bcrypt";
import emailService from "./emailService";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const OTP_TTL_MIN = 5;

const salt = bcrypt.genSaltSync(10);

// let hashUserPassword = (password) =>{,
//     return new Promise(async (resolve, reject) => {
//         try {
//             let hashPassword = await bcrypt.hashSync(password, salt);
//             resolve(hashPassword)
//         } catch (error) {
//             reject(error);
//         }
//     })
// }

let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: userEmail },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};

      let isExist = await checkUserEmail(email);
      if (isExist) {
        //user already exist
        let user = await db.User.findOne({
          where: { email: email },
          attributes: [
            "id",
            "email",
            "roleId",
            "password",
            "lastName",
            "firstName",
          ],
          raw: true,
        });
        if (user) {
          //compare password
          let check = await bcrypt.compareSync(password, user.password);
          if (check) {
            userData.errCode = 0;
            userData.errMessage = "Oce";

            delete user.password;
            userData.user = user;
          } else {
            userData.errCode = 3;
            userData.errMessage = "Wrong password!";
          }
        } else {
          //return error
          userData.errCode = 2;
          userData.errMessage = `User's not found`;
          resolve(userData);
        }
      } else {
        //return error
        userData.errCode = 1;
        userData.errMessage = `Your's Email isn't exist in your system. Pleas try other email!`;
      }
      resolve(userData);
    } catch (error) {
      reject(error);
    }
  });
};

const genOtp5 = () => {
  const n = crypto.randomInt(0, 100000);
  return String(n).padStart(5, "0");
};

const sha256 = (text) => {
  return crypto.createHash("sha256").update(text).digest("hex");
};

let sendForgotPasswordOtp = async (email) => {
  if (!email) {
    return { errCode: 1, errMessage: "Missing email" };
  }

  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    return { errCode: 2, errMessage: "Email không tồn tại trong hệ thống" };
  }

  const otp = genOtp5();
  const otpHash = sha256(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

  const row = await db.Password_reset_otp.create({
    email,
    otpHash,
    expiresAt,
    usedAt: null,
  });

  await emailService.sendOtpEmail(email, otp);

  return { errCode: 0, data: { otpId: row.id } };
};

let verifyForgotPasswordOtp = async (data) => {
  const { email, otpId, otp } = data;

  if (!email || !otpId || !otp) {
    return { errCode: 1, errMessage: "Missing required fields" };
  }

  const row = await db.Password_reset_otp.findOne({
    where: { id: otpId, email },
    raw: false,
  });

  if (!row) {
    return { errCode: 2, errMessage: "OTP không tồn tại" };
  }

  if (row.usedAt) {
    return { errCode: 3, errMessage: "OTP đã được sử dụng" };
  }

  if (new Date() > new Date(row.expiresAt)) {
    return { errCode: 4, errMessage: "OTP đã hết hạn" };
  }

  const incomingHash = sha256(String(otp).trim());
  if (incomingHash !== row.otpHash) {
    return { errCode: 5, errMessage: "OTP không đúng" };
  }

  row.usedAt = new Date();
  await row.save();

  const resetToken = jwt.sign(
    { email, otpId: row.id, purpose: "RESET_PASSWORD" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10m" }
  );

  return { errCode: 0, data: { resetToken } };
};

let resetForgotPassword = async (data) => {
  const { resetToken, newPassword, confirmPassword } = data;

  if (!resetToken || !newPassword || !confirmPassword) {
    return { errCode: 1, errMessage: "Missing required fields" };
  }

  if (newPassword !== confirmPassword) {
    return { errCode: 2, errMessage: "Mật khẩu không khớp" };
  }

  let payload;
  try {
    payload = jwt.verify(resetToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (e) {
    return {
      errCode: 3,
      errMessage: "Reset token không hợp lệ hoặc đã hết hạn",
    };
  }

  if (payload.purpose !== "RESET_PASSWORD") {
    return { errCode: 4, errMessage: "Token sai mục đích" };
  }

  const user = await db.User.findOne({ where: { email: payload.email }, raw : false});
  if (!user) {
    return { errCode: 5, errMessage: "User không tồn tại" };
  }

  const hashed = await bcrypt.hash(newPassword, salt);
  user.password = hashed;
  await user.save();

  return { errCode: 0, errMessage: "Đổi mật khẩu thành công" };
};

module.exports = {
  handleUserLogin: handleUserLogin,
  sendForgotPasswordOtp: sendForgotPasswordOtp,
  verifyForgotPasswordOtp: verifyForgotPasswordOtp,
  resetForgotPassword: resetForgotPassword,
};
