let request = require("../config/trocuttapiconnection")

class Announcement {

    static creates(id,login,objectid,datestart,dateend,callback) {
        request.put({
            url: request.url + request.db + id,
            body: {
                type:'announcement',
                created_at: new Date(),
                status:'available',
                owner: login,
                object: objectid,
                datestart: datestart,
                dateend: dateend,
            },
            json: true,
        },function(err, resp, body) {
            if (err){
            }
            if (body.ok) {
                callback(body)
            }
        })
    }
}

module.exports = Announcement;