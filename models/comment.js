let request      = require("../config/trocuttapiconnection")
let Object       = require("./object")
let Announcement = require("./announcement")
let design       = "_design/announcement/"

class Comment {
  static addComment(announcementId, login, comment, rating, condition, callback) {

      Announcement.getById(announcementId, function(err, body){
          if (err) {
              callback(err,body)
          } else {
            let error = 0
            var index
            var i = 0
            var found = false

            if(body.requests !== undefined && body.requests.length > 0){
                while(i < body.requests.length || found == false){
                  if(body.requests[i].accepted !== undefined && body.requests[i].accepted === "oui" && body.requests[i].borrower.login !== undefined && body.requests[i].borrower.login === login && body.requests[i].comment === undefined){
                    index = i
                    found = true
                  }
                  i++
                }
              }else{
                error = 1
              }

              if (error == 0 && found == true) {
                  body.requests[index].comment = comment
                  body.requests[index].rating = rating
                  body.requests[index].condition = condition
                  body.requests[index].date_comment = new Date()

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

module.exports = Comment
