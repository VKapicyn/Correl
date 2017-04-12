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
            //console.log(sort);
            res.render('portfel',{sectors: result, sort: sort, config: config})
        })
        
    })
}

exports.getGraph = function(){

    res.send();
}

exports.portfelConfig = function(req, res){
    try{
        let someData = {
            "price": req.body.price,
            "effect": req.body.effect,
            "count": req.body.count
        };
        let data = JSON.parse(fs.readFileSync('src/portfelConfig.json', 'utf8'));
        data.price = (someData.price == '') ? data.price : someData.price;
        data.effect = (someData.effect == '') ? data.effect : someData.effect;
        data.count = (someData.count == '') ? data.count : someData.count;

        let dataJson = JSON.stringify(data);
        fs.writeFile('src/portfelConfig.json', dataJson);
        res.send('сохранил</br><a href="/show">вернуться</a>')
    }
    catch(e){
        console.log(e); res.send('Неверные входные данные');
    }
}