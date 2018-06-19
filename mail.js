/* ---- Minimum parameters of the buildMail function needed ---- */
/*
  let requestSender = {
    'givenName' : '',
    'surname' : '',
    'mail' : ''
  }

  let objectOwner = {
    'mail' : ''
  }

  let announcement = {
    'title' : ''
  }
*/

var exports = module.exports = {}
const nodemailer = require('nodemailer')

exports.buildMail = function(requestSender, objectOwner, announcement, emailType){
  let mailContent
  let mailType = {
    request : {
      'subject': 'Troc\'UTT - Demande de prêt reçue',
      'text': requestSender.givenName + ' ' + requestSender.surname + ' souhaite vous empruinter l\'object proposé dans l\'annonce "' + announcement.title + '." Pour accepter ou refuser l\'offre, connectez vous sur l\'application Troc\'UTT rubrique "Mes annonces" et rendez-vous sur l\'annonce concernée. \n\nAdresse mail de l\'expéditeur de la requête : ' + requestSender.mail,
      'mail' : objectOwner.mail
    },
    acceptedRequest : {
      'subject': 'Troc\'UTT - Demande de prêt acceptée',
      'text': 'Votre demande de prêt concernant l\'objet ' + announcement.title + 'a été acceptée. Contactez le propiétaire de celui-ci pour fixer une date et un lieu de rendez-vous. \n\nAdresse mail du propriétaire : ' + objectOwner.mail,
      'mail' : requestSender.mail
    },
    refusedRequest : {
      'subject': 'Troc\'UTT - Demande de prêt refusée',
      'text': 'Votre demande de prêt concernant l\'objet ' + announcement.title + 'n\'a pas été acceptée.',
      'mail' : requestSender.mail
    }
  }

  switch(emailType) {
      case 'request':
          mailContent = mailType.request
          break;
      case 'acceptedRequest':
          mailContent = mailType.acceptedRequest
          break;
      case 'refusedRequest':
          mailContent = mailType.refusedRequest
          break;
      default:
  }
  return mailContent
}

exports.buildMessage = function(mailContent){
  // setup email data with unicode symbols
  let message = {
      from: 'trocutt@gmail.com',
      to: mailContent.mail,
      subject: mailContent.subject,
      text: mailContent.text
  }
  return message
}

// send mail with defined transport object
exports.sendMail = function(message){
  let transporter = nodemailer.createTransport({
    host: 'email-smtp.eu-west-1.amazonaws.com',
    port: 587,
    secure: false,
    auth: {
        user: 'AKIAI3FD6BKP4JKVD2AA',
        pass: 'AkwSDJnUm5NOSPTnFZMWjIOwUrTLrl0CHsJLJNFe0gWL'
    }
  })

  transporter.sendMail(message, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
}
