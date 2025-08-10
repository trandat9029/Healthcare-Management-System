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

let getAbout = (req, res) =>{
    return res.render('test/test.ejs')
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




module.exports = {
    getHomePage: getHomePage, 
    getAbout: getAbout,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
}