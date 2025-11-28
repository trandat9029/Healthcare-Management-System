import handbookService from '../services/handbookService'

let handleCreateHandbook = async (req, res) =>{
    try {
            let info = await handbookService.handleCreateHandbook(req.body);
            return res.status(201).json(info);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                errCode: -1,
                errMessage: 'Error from the server!'
            })
        }

}

let handleEditHandbook = async (req, res) =>{
    try {
        let message =  await handbookService.handleEditHandbook(req.body);
        return res.status(200).json(message);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let handlePostHandbook = async (req, res) =>{
    try {
        let message =  await handbookService.handlePostHandbook(req.body);
        return res.status(200).json(message);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let handleGetAllHandbook = async (req, res) => {
    try {
        let page = +req.query.page || 1;
        let limit = +req.query.limit || 8;
        let sortBy = req.query.sortBy || 'name';
        let sortOrder = req.query.sortOrder || 'ASC';

        let info = await handbookService.handleGetAllHandbook(
        page,
        limit,
        sortBy,
        sortOrder
        );

        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
        errCode: -1,
        errMessage: 'Error from the server!',
        });
    }
};

let handleGetListPostHandbook = async (req, res) =>{
    try {
        let info = await handbookService.handleGetListPostHandbook();
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let handleGetDetailHandbookById = async (req, res) =>{
    try {
        let info = await handbookService.handleGetDetailHandbookById(req.query.id);
        return res.status(200).json(info);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }
}

let handleDeleteHandbook = async (req, res) =>{
    try {
        let message =  await handbookService.handleDeleteHandbook(req.body.id);
        return res.status(200).json(message);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server!'
        })
    }  
}

module.exports = {
    handleCreateHandbook : handleCreateHandbook ,
    handleEditHandbook: handleEditHandbook,
    handlePostHandbook: handlePostHandbook,
    handleGetAllHandbook: handleGetAllHandbook,
    handleGetListPostHandbook: handleGetListPostHandbook,
    handleGetDetailHandbookById: handleGetDetailHandbookById,
    handleDeleteHandbook: handleDeleteHandbook,
    
}