import jwt from 'jsonwebtoken';

require('dotenv').config();

export const protectedRoute = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        errCode: 1,
        errMessage: 'Access token không tồn tại'
      });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          errCode: 2,
          errMessage: 'Access token không hợp lệ hoặc hết hạn'
        });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Lỗi server'
    });
  }
};
