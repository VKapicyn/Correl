let Stock = require('../models/stock').stock;
let Sector = require('../models/sector').sector;
let tickerModel = require('../models/sector').tickersModel;
let historyMonth = require('../models/stock').historyMonth;
var sectors_name = require('../models/sector').getSectors();
var signals = require('../models/signals');

exports.selection = function(req, res){
    let sectors = [];
    let dop;
        dop = (req.body.closer == 'on') ? 1: 0;
        console.log(dop);
    sectors_name.map(sector_name => sectors.push(new Sector(sector_name))) 
    //проход по секторам
    sectors.map(sector => {
        let rows = [];
        //проход по акциям сектора
        sector.getHistory(sector.getName()).then(function(tickers, err){
            console.log(sector.getName());
            tickers.map(ticker => {
                if (check_signals(req.body, ticker.history, dop).truth){
                    let stock_mark = [];
                    //проверяем всю историю и добавляем акцию в таблицу сектора
                    for(let i=1+dop; i<=ticker.history.length; i++){
                        try{
                        let result = check_signals(req.body, ticker.history, i)
                        if (result.truth)
                            stock_mark.push(result);
                        }
                        catch(e){
                            continue;
                        }
                    }
                    console.log(ticker.name);
                    let table_element = {};
                    table_element.ticker = ticker.name;
                    table_element.effect = 0;
                    table_element.count = stock_mark.length;
                    table_element.price = Math.round(ticker.history[1+dop].Close*100)/100;

                    let good = 0, bad = 0;
                    stock_mark.map(mark => {
                        if (mark.diff > 0)
                            good++;
                        else
                            bad++;
                    })
                    table_element.effect = (table_element.count>0) ? (Math.round((good/table_element.count)*10000))/100 : 0;
                    //добавляем подходящую акцию в таблицу сектор
                    rows.push(table_element);
                }
            })
        }).then(function(){
            sector.setTable(rows);
        });
        
    });
    //res.render('portfel', sectors);
    res.redirect('/settings');
}

exports.settings = function(req, res){
    historyMonth.find().then(function(result){
        //console.log(result);
        if (result.length != 0)
        {   
            let count_promise = new Promise((resolve, reject) => {
                var all ={};
                all.count = 0; all.good = 0; all.bad = 0;

                tickerModel.find().then(function(data){
                    for(let i=0; i<data.length; i++){
                        all.count = all.count + data[i].tickers.length;
                    }
                    return all;
                }).then(function(all){
                    result.map(sector => {
                        all.good = all.good + sector.good;
                        all.bad = all.bad + sector.bad;
                        all.update = sector.update;
                    });
                    return all;
                }).then(function(all){
                    resolve(all);
                });

            });
            
            count_promise.then(function(all, err){
                tickerModel.find().then(function(results){
                    let selcount = 0;
                    results.map(x => {
                        selcount += x.table.length;
                    })
                    res.render('settings', {
                    lastUpdate: result[0].update,
                    count: all.good,
                    bad: all.bad,
                    procent: (all.good / all.count * 100).toFixed(2),
                    updated: ((all.good + all.bad) / all.count * 100).toFixed(2),
                    selectorCount: selcount
                    });
                });
            });
            

        }
        else
        {
            res.render('settings', {
                lastUpdate: 'Никогда',
                count: 0
            });
        }    
    })
}

//Работает. НЕ ТРОГТЬ!!!
exports.update = function(req, res){
    let sectors_name = require('../models/sector').getSectors();
    let sectors = [];
    historyMonth.find().remove().exec();

    sectors_name.map(sector_name => sectors.push(new Sector(sector_name)));

    recurs2(0);

    function recurs2(j){
        let stocks = [];
        sectors[j].getTickers().then(function(tickers, err){
            tickers.map(ticker => {
                stocks.push(new Stock(ticker));
            })
            return stocks;
        }).then(function(_stocks){;
            if(j<sectors.length-1){
                upakovka(_stocks,j,sectors[j]);
            }
        });
    }

    function upakovka(stocks, j, sector){
        let historyPromise = new Promise((resolve, reject) => {
            let itog = {};
            itog.history = [];
            itog.good = 0;
            itog.bad = 0;
            function recurs(i,stocks){
                stocks[i].setHistory(stocks[i].getTicker(), sector.name).then(function(result, error){
                    if(i<stocks.length-1){
                        i++;
                        recurs(i,stocks);
                        if(result!='error'){
                            itog.good++;
                            itog.history.push(result);
                        }
                        else
                            itog.bad++;
                    }
                    if (i == stocks.length-1){
                        resolve(itog);
                    }
                })
            }  
            recurs(0, stocks);
        });
        historyPromise.then(function(reslt, err){
            let tick = new historyMonth();
            tick.tickers = reslt.history;
            tick.good = reslt.good;
            tick.bad = reslt.bad;
            tick.update = new Date();
            tick.sector = sector.name;
            tick.save();
            console.log('cхоронил', j)

            j++;
            recurs2(j);
        })
    }
    
    res.redirect('/settings');
}


//увеличить число возвращаемых значений для подсчета статистики
function check_signals(args, history, month){
    let check = [], i = 0, result = {};

//ошибка в заполнении check при проверки сигнала
    if (args.one == 'on'){
        i++;
        if (signals.one(history, month)==true)
            check.push(true);
        else
            check.push(false);
    }
    if (args.two == 'on'){
        i++;
        if (signals.two(history, month))
            check.push(true);
        else
            check.push(false);                 
    }
    if (args.three == 'on'){
        i++;
        if (signals.three(history, month))
            check.push(true);
        else
            check.push(false);
    }
    if (args.four == 'on'){
        i++;
        if (signals.four(history, month))
            check.push(true);
        else
            check.push(false);
    }

    let j=0;

    check.map(x => {
        if (x == true)
            j++;
    })

    //если все отмеченные условия выполнены
    result.truth = ((j == check.length) && (i == check.length)) ? true : false;
    if (month>0)
        result.diff = Number(history[month-1].Close) - Number(history[month].Close);
    else
        result.diff = 0;

    return result;
}