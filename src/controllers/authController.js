import jwt from 'jsonwebtoken';
import authService from '../services/authService';

require('dotenv').config();

const accessTtl = process.env.ACCESS_TOKEN_TTL || '6h';
const refreshTtl = process.env.REFRESH_TOKEN_TTL || '14d';

const isProd = process.env.NODE_ENV === 'development';

const refreshTtlMs = Number(process.env.REFRESH_TOKEN_TTL_MS) || (14 * 24 * 60 * 60 * 1000);

const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: accessTtl });
};

const signRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: refreshTtl });
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: refreshTtlMs
  });
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        errCode: 1,
        message: 'Missing inputs parameter!'
      });
    }

    const userData = await authService.handleUserLogin(email, password);

    if (userData.errCode !== 0) {
      return res.status(401).json({
        errCode: userData.errCode,
        message: userData.errMessage
      });
    }

    const payload = {
      userId: userData.user.id,
      roleId: userData.user.roleId
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      errCode: 0,
      message: 'OK',
      user: userData.user,
      accessToken
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      message: 'Error from server'
    });
  }
};

const handleRefreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        errCode: 1,
        message: 'Không tìm thấy refresh token'
      });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          errCode: 2,
          message: 'Refresh token không hợp lệ hoặc hết hạn'
        });
      }

      const newAccessToken = signAccessToken({
        userId: decoded.userId,
        roleId: decoded.roleId
      });

      return res.status(200).json({
        errCode: 0,
        message: 'OK',
        accessToken: newAccessToken
      });
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      message: 'Error from server'
    });
  }
};

const handleLogout = async (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    });
    return res.sendStatus(204);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      message: 'Error from server'
    });
  }
};

export default {
  handleLogin,
  handleRefreshToken,
  handleLogout
};
