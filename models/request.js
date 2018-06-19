let request = require("../config/trocuttapiconnection")
let design = "_design/requests/"

class Request {
    static getRequestForBorrower(BorrowerLogin,callback) {
        request.get({
            url: request.url + request.db + design + "_view/getRequests?include_docs=true&key=\""+BorrowerLogin+"\"",
            json: true,
        },function(err, resp, body) {
            if (err){
                callback(err,body)
            }
            else{
                let listOfAnnouncementWithRequests = []
                for (let res of body.rows) {
                    let AnnouncementWithRequest = res.value
                    AnnouncementWithRequest.Announcement._object = res.doc
                    listOfAnnouncementWithRequests.push(AnnouncementWithRequest)
                }
                callback(null,listOfAnnouncementWithRequests)
            }
        })
    }
}

module.exports = Request;