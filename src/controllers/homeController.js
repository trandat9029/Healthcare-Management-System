let getHomePage = (req, res) =>{
    return res.render('homepage.ejs');
}

let getAbout = (req, res) =>{
    return res.render('test/test.ejs')
}


module.exports = {
    getHomePage: getHomePage, 
    getAbout: getAbout,
}