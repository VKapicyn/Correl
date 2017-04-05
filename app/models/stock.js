var mongoose = require('mongoose');
var request = require("request")

class stock{
    constructor(ticker){
        this.ticker = ticker;
    }

    getTicker(){
        return this.ticker;
    }

    getHistory(){
        return new Promise((resolve, reject) => {
            historyMonth.find({ticker: this.ticker}).then(function(result){
                resolve(result.history);
            });
        });
    }

    setHistory(ticker){
        return new Promise((resolve, reject) => {
            downloadHistory(ticker).then(function(result, err){
                if (result!=undefined){
                    let tick = {};
                    tick.name = ticker;
                    tick.history = result;
                    resolve(tick);
                }
                else{
                    resolve('error');
                }
            });
        });
    }
}

module.exports.stock = stock;

var monthSchema = new mongoose.Schema({
    tickers: [{
        name: String,
        history: [{
            Date: String, //mongoose.Schema.Types.Date,
            Close: String,
            Open: String,
            High: String,
            Low: String,
            Volume: String,
            Adj: String
        }]
    }],
    sector: String,
    update: String,
    good: Number,
    bad: Number
})

var historyMonth = mongoose.model('historyMonth', monthSchema);
module.exports.historyMonth = historyMonth;

function downloadHistory(ticker){
    return new Promise((resolve, reject) => {
        var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D%27http%3A%2F%2Fchart.finance.yahoo.com%2Ftable.csv%3Fs%3D'+ticker+'%26a%3D'+0+'%26b%3D'+01+'%26c%3D'+2010+'%26d%3D'+2+'%26e%3D'+22+'%26f%3D'+2017+'%26g%3Dm%26ignore%3D.csv%27%20and%20columns%3D%27Date%2COpen%2CHigh%2CLow%2CClose%2CVolume%2CAdj%27&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
        request({
            url: url,
            json: true
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {

                    let data;
                    try{
                        data = JSON.parse(JSON.stringify(body['query']['results']['row']));
                        resolve(data);
                    }
                    catch(e){
                        resolve(undefined);
                    }
                }
            });     
        });
}