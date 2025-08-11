import db from "../models";
import CRUDService from "../services/CRUDService";

let getHomePage = async (req, res) =>{
    try {
        let data = await db.User.findAll();
        console.log('----------------');
        console.log(data)
            return res.render('homepage.ejs', {data : JSON.stringify(data)});
    } catch (error) {
        console.log(error)
    }
    

}


let getCRUD = (req, res) =>{
    return res.render('crud.ejs');
}

let postCRUD = async (req, res) =>{
    let message = await CRUDService.createNewUser(req.body);
    console.log(req.body);
    console.log(message);
    return res.send('post crud from server');
}

let displayGetCRUD = async (req, res) =>{
    let data = await CRUDService.getAllUser();
    console.log("data for getAllUser");
    console.log(data);
    console.log("--------");
    
    return res.render('displayCRUD.ejs', {
        dataTable: data
    });
}

let getEditCRUD = async (req, res) =>{
    let userId = req.query.id;
    console.log(userId);
    
    if(userId){
        let userData = await CRUDService.getUserInfoById(userId);
        //check data user not found
        
        return res.render('editCRUD.ejs', {
            user: userData,
        })
    }else{
        return res.send("User not found");
    }
}

let putCRUD = async (req, res) =>{
    let data = req.body;
    let allUser = await CRUDService.updateUserData(data);
    return res.render('displayCRUD.ejs', {
        dataTable: allUser,
    });
}


module.exports = {
    getHomePage: getHomePage, 
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
    getEditCRUD: getEditCRUD,
    putCRUD: putCRUD,
}