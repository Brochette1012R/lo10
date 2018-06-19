let request = require("../config/trocuttapiconnection")
let design = "_design/requests/"
let Announcement = require("./announcement")
let uuidv4 = require('uuid/v4')
let moment = require("moment")

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

    static refuseRequest(announcementId, login, callback) {

        Announcement.getById(announcementId, function(err, body){

            if (err) {
                callback(err,body)
            } else {
                if(body._object){
                    delete body._object;
                }
                if(body.requests !== undefined) {
                    let i = 0
                    let flag = false
                    while ( i < body.requests.length && flag===false) {
                        if (body.requests[i].borrower.login === login) {
                            if(body.requests[i].accepted === undefined || body.requests[i].accepted === "oui"){
                                body.requests[i].accepted = "non"
                                body.requests[i]['response-date'] = new Date()
                                flag=true
                            }
                        }
                        i=i+1
                    }
                    // s'il y a une modif a faire
                    if(flag === true){
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
                    }else{
                        callback({err: "pas besoin de modifier la demande"},body)
                    }

                }else{
                    // pas de request dans ce document donc rien à rejeter
                    callback({err: "pas de demandes sur cette annonce"},body)
                }
            }
        });
    }

    static acceptRequest(announcementId, login, callback) {

        Announcement.getById(announcementId, function(err, body){
            if (err) {
                callback(err,body)
            } else {
                if(body._object){
                    delete body._object;
                }
                if(body.requests !== undefined) {
                    let i = 0
                    let flag = false
                    while ( i < body.requests.length ) {
                            if(body.requests[i].accepted === undefined ){
                                flag = true
                                if (body.requests[i].borrower.login === login) {
                                    body.requests[i].accepted = "oui"
                                    body.requests[i]['response-date'] = new Date()
                                    body.status = "indisponible"
                                    let datestart = moment().add(1,'d')
                                    let dateend = datestart.add(1,'h')
                                    body.appointment = {
                                        DTSTART: datestart.format("YYYYMMDD")+"T"+datestart.format("HHMM")+"00Z",
                                        DTEND: dateend.format("YYYYMMDD")+"T"+dateend.format("HHMM")+"00Z",
                                        DTSTAMP: moment().format("YYYYMMDD")+"T"+moment().format("HHMM")+"00Z",
                                        UID: uuidv4(),
                                        CREATED: moment().format("YYYYMMDD")+"T"+moment().format("HHMM")+"00Z",
                                        DESCRIPTION: "Rdv Trocutt",
                                        "LAST-MODIFIED": moment().format("YYYYMMDD")+"T"+moment().format("HHMM")+"00Z",
                                        LOCATION: "UTT",
                                        SEQUENCE: "0",
                                        STATUS: "CONFIRMED",
                                        SUMMARY: "Trocutt",
                                        TRANSP: "OPAQUE"
                                    }
                                }else{
                                    body.requests[i].accepted = "non"
                                    body.requests[i]['response-date'] = new Date()
                                }
                        }
                        i=i+1
                    }
                    // s'il y a une modif a faire
                    if(flag === true){
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
                    }else{
                        callback({err: "pas besoin de modifier la demande"},body)
                    }

                }else{
                    // pas de request dans ce document donc rien à rejeter
                    callback({err: "pas de demandes sur cette annonce"},body)
                }
            }
        });
    }
}

module.exports = Request;