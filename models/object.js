let request = require("../config/trocuttapiconnection")

class Object{
    static creates(id,name,description,callback) {
        request.put({
            url: request.url + request.db + id,
            body: {
                type:'object',
                created_at: new Date(),
                name: name,
                description: description,
            },
            json: true,
        },function(err, resp, body) {
            if (err){
                callback(err,body)
            }
            if (body) {
                callback(null,body)
            }
        }
        )
    }

    static getById(id,callback) {
        request.get({
            url: request.url + request.db + id,
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
}

module.exports = Object;