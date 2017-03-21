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

    //Переделать в связи с оптимизированной схемой данных
    setHistory(ticker){
        return new Promise((resolve, reject) => {
            historyMonth.find().then(function(tickers){
                console.log('zashel', tickers);
                let j = 0;
                if(tickers.length != 0){
                    for(let i=0; i<tickers[0].ticker.length; i++){
                        if(tickers[0].ticker[i].name == ticker){
                            j++;
                            downloadHistory().then(function(result, err){
                                if (result == undefined || result == null)
                                    reject(1);
                                tickers[0].ticker[i].history = result;
                            });
                            break;
                        }
                    }
                    if (j == 0){

                    let tick = {};
                    tick.name = ticker;
                    downloadHistory(ticker).then(function(result, err){
                        if (result == undefined || result == null)
                            reject(1);
                        tick.history = result;
                        tickers[0].ticker.push(tick);
                    });
                    resolve(1);
                    }
                    tickers[0].save();
                }
                else{
                    let base = new historyMonth(); 
                    base.save();
                }
            });
        });
    }
}

module.exports.stock = stock;

var monthSchema = new mongoose.Schema({
    name: String,
    history: [{
        Date: String, //mongoose.Schema.Types.Date,
        Close: Number,
        Open: Number,
        High: Number,
        Low: Number
    }]
})

var historyMonth = mongoose.model('historyMonth', monthSchema);
module.exports.historyMonth = historyMonth;

function downloadHistory(ticker){
    return new Promise((resolve, reject) => {
        var url = 'http://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol='+ticker+'&apikey=8495';
        request({
            url: url,
            json: true
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {

                    let data = JSON.parse(JSON.stringify(body['Monthly Time Series']));
                    let mass = [];
                    let keys = Object.keys(data);
                    keys.map(key => {
                        let obj = {};
                        obj.Date = key;
                        obj.Close = data[key]['4. close'];
                        obj.Open = data[key]['1. open'];
                        obj.High = data[key]['2. high'];
                        obj.Low = data[key]['3. low'];
                        mass.push(obj);
                    });
                    resolve(mass);
                }
            });     
        });
}