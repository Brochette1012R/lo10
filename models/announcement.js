let request = require("../config/trocuttapiconnection")
let Object = require("./object")

class Announcement {

    static creates(id,login,objectid,datestart,dateend,callback) {
        request.put({
            url: request.url + request.db + id,
            body: {
                type:'announcement',
                created_at: new Date(),
                status:'disponible',
                owner: login,
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
}

module.exports = Announcement;