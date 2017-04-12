var mongoose = require('mongoose');

var portfelSchema = new mongoose.Schema({
    price: Number,
    point: Number,
    startDate: String,
    endDate: String,
    tickers: [{
        price: Number,
        ticker: String,
        weight: Number
    }]
})

var portfelModel = mongoose.model('index', portfelSchema);
module.exports.portfelModel = portfelModel;

exports.addInIndex = function(req, res){
    let tickers = [];
    req.body.tickers.map(ticker => {
        let obj = {}
        obj.ticker = ticker.split(';')[0];
        obj.price = ticker.split(';')[1];
        obj.weight = 1;
        tickers.push(obj);
    });

    let max = 0;
    tickers.map(ticker => {
        if (Number(ticker.price) > Number(max)){
            max = ticker.price;
        }
    });

    tickers.map(ticker => {
        ticker.weight = Math.round(Number(max)/Number(ticker.price));
    })

    portfelModel.find().then(function(result){
        let obj = new portfelModel();
        obj.point = result.length;
        obj.startDate = new Date();
        obj.tickers = tickers;
        obj.price = 0;
        tickers.map(ticker => {
            obj.price = Number(obj.price) + Number(ticker.price)*Number(ticker.weight);
        })
        obj.save();
    })
    res.redirect('/show')
}

exports.graph = function(req, res){
    let itog = [];

    portfelModel.find().then(function(result){
        result.map(x => {
            
        })
    })
    res.json(itog);
}