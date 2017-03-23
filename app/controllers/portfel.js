let Stock = require('../models/stock').stock;
let Sector = require('../models/sector').sector;
let tickerModel = require('../models/sector').tickersModel;
let historyMonth = require('../models/stock').historyMonth;
var sectors_name = require('../models/sector').getSectors();

exports.selection = function(req, res){
    let sectors = [];
    sectors_name.map(sector_name => sectors.push(new Sector(sector_name))) 
    //проход по секторам
    sectors.map(sector => {
        let stocks = [];
        
        //проход по акциям сектора
        sector.getTickers().then(function(tickers, err){
            let ok_stocks = [];
            tickers.map(ticker => {
                stocks.push(new Stock(ticker));
            });
            stocks.map(stock => {
                            console.log(stock)
                //получаем историю для каждой акции
                stock.getHistory().then(function(history, err){
                    //проверка на прохождение условий последнего месяца
                    if (check_signals(req.params, history, 0).truth){
                        let stock_mark = [];
                        //проверяем всю историю и добавляем акцию в таблицу сектора
                        for(let i=1; i<history.length; i++){
                            let result = check_signals(req.params, history, i)
                            if (result.truth)
                                stock_mark.push(result);
                        }
                        
                        let table_element = {};
                        table_element.ticker = stock.getTicker;
                        table_element.effect = 0;
                        table_element.count = stock_mark.length;
                        table_element.price = history[0].Close;

                        let good = 0, bad = 0;
                        stock_mark.map(mark => {
                            if (mark.diff > 0)
                                good++;
                            else
                                bad++;
                        })
                        table_elemnt.effect = (good/bad)*100;
                        //добавляем подходящую акцию в сектор
                        setTable(table_element);
                    }
                });
            });
        });
    });
    res.render('portfel', sectors);
}

exports.settings = function(req, res){
    historyMonth.findOne().then(function(result){
        //console.log(result);
        if (result.tickers.length!=0)
        {   
            let count_promise = new Promise((resolve, reject) => {
                var all_count = 0;
                tickerModel.find().then(function(data){
                    for(let i=0; i<data.length; i++){
                        all_count = all_count + data[i].tickers.length;
                    }
                    resolve(all_count);
                })
            });
            count_promise.then(function(reslt, err){
                res.render('settings', {
                lastUpdate: result.update,
                count: result.good,
                bad: result.bad,
                procent: (result.good / reslt * 100).toFixed(2),
                updated: ((result.good + result.bad) / reslt * 100).toFixed(2)
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
    historyMonth.findOne().then(function(tick){
        tick.tickers = [];
        tick.good = 0;
        tick.bad = 0;
        tick.save();
    });

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
            function recurs(i,stocks){
                stocks[i].setHistory(stocks[i].getTicker(), sector.name).then(function(result, error){
                    if(i<stocks.length-1){
                        i++;
                        recurs(i,stocks);
                        console.log(i, stocks.length);
                    }
                    if (i == stocks.length-1){
                        resolve();
                    }
                })
            };
            historyMonth.findOne().then(function(tick){
                tick.update = new Date();
                recurs(0, stocks);
                tick.save();
            });
        });
        historyPromise.then(function(reslt, err){
            j++;
            recurs2(j);
        })
    }
    
    res.redirect('/settings');
}


//увеличить число возвращаемых значений для подсчета статистики
function check_signals(args, history, month){
    let check = [], i = 0, result = {};
    
    if (args.one){
        if (signals.one(history, month))
            check.push(true);
        else
            check.push(false);
    }
    if (args.two){
        if (signals.two(history, month))
            check.push(true);
        else
            check.push(false);                 
    }
    if (args.three){
        if (signals.three(history, month))
            check.push(true);
        else
            check.push(false);
    }
    if (args.for){
        if (signals.for(history, month))
            check.push(true);
        else
            check.push(false);
    }

    check.map(x => {if (x) i++})

    //если все отмеченные условия выполнены
    result.truth = (i == check.length) ? true : false;
    result.diff = history[month+1].Close - history[month].Close;

    return result;
}