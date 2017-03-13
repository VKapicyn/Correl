var historyModel = require('/app/models/historyDataModel').historyModel;

exports.monitoring = function(){
    //let data = [];
    /*в дальнейшем добавить функцию выгрузки из БД, объект в data будет иметь вид
        data.ftn (first_ticker_name)
        data.stn (second_ticker_name)
        data.kf - кф корреляции
    */

    historyModel.findOne().then(function(data){
        let config = require('/app/models/historyDataModel').getConfig();

        let more = 0;
        let less = 0;
        for (let i = 0; i < data.length; i++){
            if (data[i].kf <= config.kf)
                less++;
            else
                more++
        }
        
        let procent = (data.length/100) * more;
        if (procent >= config.procent){
            sendEmail();
        }
        else
            console.log('не выслал');
    });
}

function sednEmail(){
    console.log('выслал');
}
