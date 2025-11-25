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
let handleGetAllHandbook = async (req, res) =>{
    try {
        let info = await handbookService.handleGetAllHandbook();
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

module.exports = {
    handleCreateHandbook : handleCreateHandbook ,
    handleGetAllHandbook: handleGetAllHandbook,
    handleGetDetailHandbookById: handleGetDetailHandbookById,

}