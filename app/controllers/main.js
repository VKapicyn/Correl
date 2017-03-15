var historyModel = require('../models/db-model').historyModel;
var fs = require('fs');

exports.mainPage = function (req, res){
    let data = require('../models/historyDataModel').getConfig();
    res.render('main', {data: data});
};

exports.setConfig = function (req, res){
    //сохранение конфига
    try{
        let someData = {
            "kf": req.body.kf,
            "procent": req.body.procent,
            "period": req.body.period,
            "price": req.body.price,
            "tickers": req.body.tickers
        };
        let data = require('../models/historyDataModel').getConfig()
        console.log(someData.kf, data.procent);
        data.kf = (someData.kf == '') ? data.kf : someData.kf;
        data.procent = (someData.procent == '') ? data.procent : someData.procent;
        data.period = (someData.period == '') ? data.period : someData.period;
        data.tickers = (someData.tickers == '') ? data.tickers : someData.tickers;
        data.period = someData.period;
        console.log(data.kf);
        let dataJson = JSON.stringify(data);
        fs.writeFile('src/dataConfig.json', dataJson);
        res.send('сохранил')
    }
    catch(e){
        console.log(e); res.send('Неверные входне данные');
    }
}

exports.resultJson = function (req, res){
    historyModel.findOne().then(function(result){
        /*if (req.params.sort != 'all'){
            if (req.params.sort == '-1'){

            }
            else
            {

            }
        }
        else*/
            res.json(result.history);
    });
}

exports.setEmail = function(req, res){
    try{
        let data = require('../models/historyDataModel').getConfig();
        data.email = req.body.email;
        let dataJson = JSON.stringify(data);
        fs.writeFile('src/dataConfig.json', dataJson);
        res.send('сохранил')
    }catch(e){
        console.log(e); res.send('Error')
    }
}