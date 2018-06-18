let request = require("../config/trocuttapiconnection")
let design = "_design/requests/"
let Announcement = require("./announcement")

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

    static addRequest(announcementId, login, surname, givenName, mail, callback) {

        Announcement.getById(announcementId, function(err, body){

            if (err) {
                callback(err,body)
            } else {
                let error = 0;
                if(body.requests !== undefined) {
                    for (var i = 0; i < body['requests'].length; i++) {
                        if (body['requests'][i]['borrower']['login'] === login) {
                            error = 1;
                            break;
                        }
                    }
                }else{
                    body['requests'] = []
                }
                if (error == 0) {
                    body['requests'].push(
                        {
                            'borrower': {
                                'login' : login,
                                'surname': surname,
                                'givenName' : givenName,
                                'mail': mail,
                            },
                            'sending-date' : new Date(),
                        }
                    );
                    delete body._object;

                    request.put({
                        url: request.url + request.db + announcementId,
                        body: body,
                        json: true,
                    },function(err, resp, body) {
                        if (err){
                            callback(err,body)
                        }
                        if (body) {
                            callback(null,body)
                        }
                    })
                } else {
                    //DEJA demandé
                }
            }
        });
    }
}

module.exports = Request;