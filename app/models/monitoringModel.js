var historyModel = require('./db-model').historyModel;

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
        console.log(procent);
    });
}

function sendEmail(){
    console.log('выслал');
}
