import db from "../models";

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


module.exports = {
    getHomePage: getHomePage, 
    getAbout: getAbout,
}