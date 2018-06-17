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
            }
                if (body.ok) {
                    callback(body)
                }
            }
        )
    }
}

module.exports = Object;