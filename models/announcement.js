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

    static getAllWithObjects(callback) {
        request.get({
            url: request.url + request.db + design + "_view/getAnnouncements?include_docs=true",
            json: true,
        },function(err, resp, body) {
            if (err){
                callback(err,body)
            }
            else if (body) {
                let listAnnouncements = []
                for (let res of body.rows) {
                    res.key[1]._object = res.doc
                    listAnnouncements.push(res.key[1])
                }
                callback(null,listAnnouncements)
            }
        })
    }
}

module.exports = Announcement;