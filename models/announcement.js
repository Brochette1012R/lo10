let request = require("../config/trocuttapiconnection")
let Object = require("./object")
let design = "_design/announcement/"
let moment = require("moment")

class Announcement {

    static creates(id,login,objectid,datestart,dateend,surname,givenName,mail,callback) {
        request.put({
            url: request.url + request.db + id,
            body: {
                type:'announcement',
                created_at: new Date(),
                status:'disponible',
                owner: {
                    login : login,
                    surname: surname,
                    givenName : givenName,
                    mail: mail,
                },
                object: objectid,
                datestart: datestart,
                dateend: dateend,
            },
            json: true,
        },function(err, resp, body) {
            if (err){
                callback(err,body)
            }
            if (body) {
                callback(null,body)
            }
        })
    }

    static getById(id,callback) {
        request.get({
            url: request.url + request.db + id,
            json: true,
        },function(err, resp, body) {
            if (err){
                callback(err,body)
            }
            else if (body) {
                Object.getById(body.object,function(err,bodyobject){
                    if(err){
                        callback(err,bodyobject)
                    }else if(bodyobject){
                        body._object = bodyobject
                        callback(null,body)
                    }
                })
            }
        })
    }

    static getAllWithObjectForLogin(login,ascending,callback) {

        request.get({
            url: request.url + request.db + design + "_view/getAnnouncements?startkey=[\""+login+"\"]&endkey=[\""+login+"\",{}]&include_docs=true",
            json: true,
        },function(err, resp, body) {
            if (err){
                callback(err,body)
            }
            else if (body) {
                let listAnnouncements = []
                for (let res of body.rows) {
                    let announcement = res.value.announcement
                    announcement._object = res.doc
                    if(!ascending){
                        listAnnouncements.unshift(announcement)
                    }else{
                        listAnnouncements.push(announcement)
                    }

                }
                callback(null,listAnnouncements)
            }
        })
    }

    static getAvailables(callback) {
        request.get({
            url: request.url + request.db + design + "_view/getAvailableAnnouncements?include_docs=true&descending=true",
            json: true,
        },function(err, resp, body) {
            if (err){
                callback(err,body)
            }
            else if (body) {
                let listAvailableAnnouncements = []
                for (let res of body.rows) {
                    let announcement = res.value.announcement
                    announcement._object = res.doc
                    listAvailableAnnouncements.push(announcement)
                }
                callback(null,listAvailableAnnouncements)
            }
        })
    }
}

module.exports = Announcement;
