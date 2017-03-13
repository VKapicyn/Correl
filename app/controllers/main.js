var fs = require('fs');

exports.mainPage = function (req, res){
    res.render('main');
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
        let dataJson = JSON.stringify(someData);
        fs.writeFile('src/dataConfig.json', dataJson);
    }
    catch(e){
        console.log(e); res.send('Неверные входне данные');
    }
}