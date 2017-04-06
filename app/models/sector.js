var mongoose = require('mongoose');
let historyMonth = require('../models/stock').historyMonth;

class sector{
    constructor(name){
        this.name = name;
    }

    setTable(object){
        //this.table.push(object);
        tickersModel.find({sector: this.name}).then(function(result){
                result[0].table = object;
                result[0].save();     
        })

    }

    getName(){
        return this.name;
    }

    getTable(){
        return new Promise((resolve, reject) => {
            tickersModel.findOne({sector: this.name}).then(function(result){
                resolve(result);
            });
        })
    }

    getHistory(sector){
        return new Promise((resolve, reject) => {
            historyMonth.findOne({sector: sector}).then(function(result){
                //console.log(result);
                resolve(result.tickers);
            });
        });
    }

    getTickers(){
        return new Promise((resolve, reject) => {
            //переделать на чтение и БД
            /*console.log('вызвали');
            resolve(['aapl','aame','abcd'])*/
            tickersModel.findOne({sector: this.name}).then(function(result){
                resolve(result.tickers);
            })
        });
    }
}

exports.getSectors = function(){
    return ['conglomerats','base_material','consumables','financial','health',
    'industrial','services','technological','utility_bills','zones'];
}

module.exports.sector = sector;

var tickerSchema = new mongoose.Schema({
    sector: String,
    tickers: [String],
    table: [{
        ticker: String,
        effect: Number,
        count: Number,
        price: Number
    }]
})

var tickersModel = mongoose.model('tickers', tickerSchema);
module.exports.tickersModel = tickersModel;
