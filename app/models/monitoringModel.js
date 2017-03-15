var historyModel = require('./db-model').historyModel;
var email 	= require('emailjs/email');
var pass = require('../config.js').emailPass;
var server 	= email.server.connect({
   user:    'correl.index@yandex.ru', 
   password: pass, 
   host:    'smtp.yandex.ru',
   ssl:     true
});


exports.monitoring = function(){
    historyModel.findOne().then(function(data){
        let config = require('./historyDataModel').getConfig();
        let more = 0;
        let less = 0;
        for (let i = 0; i < data.history.length; i++){
            console.log(data.history[i]);
            if (data.history[i].kf <= config.kf)
                less++;
            else
                more++
        }
        
        let procent = (data.history.length/100) * more;
        if (procent >= config.procent){
            sendEmail();
        }
        else
            console.log('не выслал');

        let sr_aref = 0;
        for(let i = 0; i < data.history.length; i++){
            sr_aref = Number(sr_aref) + Number(data.history[i].kf)
        }
        console.log(procent, sr_aref);
    });
}

function sendEmail(){
    server.send({
        text: 'Процент скоррелированых инструментов выше конфигурационного', 
        from: 'correl.index@yandex.ru',
        to: require('./historyDataModel').getConfig().email,
        subject: 'Warning'
    }, function(err, message) { console.log(err || message); });
}