let tickerModel = require('../models/sector').tickersModel;
let fs = require('fs');

exports.getPortfel = function(req, res){
    tickerModel.find().then(function(result){
        
        let config = JSON.parse(fs.readFileSync('src/portfelConfig.json', 'utf8'));
        //применяем фильтр
        let prom = new Promise((resolve, reject) => {
            let sort = [];
            result.map(sector => {
                sector.table.map(row => {
                    if (Number(row.price) >= Number(config.price)  &&
                        Number(row.effect) >= Number(config.effect) &&
                        Number(row.count) >= Number(config.count)){
                        
                        let obj = {};
                        obj.sector = sector.sector;
                        obj.price = row.price;
                        obj.effect = row.effect;
                        obj.count = row.count;
                        obj.ticker = row.ticker;
                        //console.log(obj);
                        sort.push(obj);
                    }
                })
            })
            resolve(sort);
        })
        prom.then(function(sort, err){
            console.log(sort);
            res.render('portfel',{sectors: result, sort: sort})
        })
        
    })
}

exports.getGraph = function(){

    res.send();
}

exports.portfelConfig = function(req, res){
    //как в main.js setConfig
}