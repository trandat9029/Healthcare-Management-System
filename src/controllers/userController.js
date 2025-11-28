import userService from '../services/userService'

let handleLogin = async (req, res) =>{
    let email = req.body.email;
    let password = req.body.password;

    if(!email || !password){
        return res.status(500).json({
            errCode: 1,
            message: "Missing inputs parameter!",
        })
    }

    let userData = await userService.handleUserLogin(email, password);
    
    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage,
        user: userData.user ? userData.user : {},
        
    }); 
}


let handleGetAllUsers = async (req, res) => {
    try {
        let {
        id,
        page,
        limit,
        sortBy,
        sortOrder,
        } = req.query;

        if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameter id',
            users: [],
        });
        }

        let result = await userService.getAllUsers({
        userId: id,
        page,
        limit,
        sortBy,
        sortOrder,
        });

        // Nếu query theo id cụ thể
        if (id !== 'ALL') {
        return res.status(200).json({
            errCode: 0,
            errMessage: 'Ok',
            user: result,
        });
        }

        // Nếu lấy ALL có phân trang
        return res.status(200).json({
        errCode: 0,
        errMessage: 'Ok',
        users: result.rows,
        total: result.count,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        });
    } catch (error) {
        console.log('handleGetAllUsers error', error);
        return res.status(500).json({
        errCode: -1,
        errMessage: 'Error from server',
        });
    }
};


let handleCreateNewUser = async (req, res) =>{
    let message =  await userService.createNewUser(req.body);
    return res.status(200).json(message);
    
}

let handleEditUser = async (req, res) =>{
    let data = req.body;
    let message =  await userService.updateUserData(data);
    return res.status(200).json(message);
}

let handleDeleteUser = async (req, res) =>{
    if(!req.body.id){
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing require parameter!',
        });
    }
    let message =  await userService.deleteUser(req.body.id);
    return res.status(200).json(message);
}

let getAllCode = async (req, res) =>{
    try {
        let data = await userService.getAllCodeService(req.query.type);
        return res.status(200).json(data);
    } catch (error) {
        console.log('Get allcode error: ', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

module.exports ={
    handleLogin: handleLogin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewUser: handleCreateNewUser,
    handleEditUser: handleEditUser,
    handleDeleteUser: handleDeleteUser,
    getAllCode: getAllCode,
}