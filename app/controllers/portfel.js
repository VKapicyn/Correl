let Stock = require('../models/stock').stock;
let Sector = require('../models/sector').sector;
let tickerModel = require('../models/sector').tickersModel;
let historyMonth = require('../models/stock').historyMonth;
var sectors_name = require('../models/sector').getSectors();
var signals = require('../models/signals');

exports.selection = function(req, res){
    let sectors = [];
    sectors_name.map(sector_name => sectors.push(new Sector(sector_name))) 
    //проход по секторам
    sectors.map(sector => {
        let stocks = [];
        //проход по акциям сектора
        sector.getHistory(sector.getName()).then(function(tickers, err){
            tickers.map(ticker => {
                console.log(sector.getName());
                if (check_signals(req.body, ticker.history, 0).truth){
                    let stock_mark = [];
                    //проверяем всю историю и добавляем акцию в таблицу сектора
                    for(let i=1; i<ticker.history.length; i++){
                        let result = check_signals(req.params, ticker.history, i)
                        if (result.truth)
                            stock_mark.push(result);
                    }
                    console.log(ticker.name);
                    let table_element = {};
                    table_element.ticker = ticker.name;
                    table_element.effect = 0;
                    table_element.count = stock_mark.length;
                    table_element.price = ticker.history[1].Close;

                    let good = 0, bad = 0;
                    stock_mark.map(mark => {
                        if (mark.diff > 0)
                            good++;
                        else
                            bad++;
                    })
                    table_elemnt.effect = (good/bad)*100;
                    //добавляем подходящую акцию в сектор
                    sector.setTable(table_element);
                }
                else
                    console.log('888')
            })
            /*let ok_stocks = [];
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
            });*/
        });
    });
    res.render('portfel', sectors);
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
                res.render('settings', {
                lastUpdate: result.update,
                count: all.good,
                bad: all.bad,
                procent: (all.good / all.count * 100).toFixed(2),
                updated: ((all.good + all.bad) / all.count * 100).toFixed(2)
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
        if (signals.one(history, month))
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
        if (signals.for(history, month))
            check.push(true);
        else
            check.push(false);
    }

    let j=0;
    check.map(x => j = (x == true) ? j++ : j)
        console.log(i, check, check.length);
    //ПЕРЕДЕЛАТЬ!!!
    //если все отмеченные условия выполнены
    result.truth = ((j == check.length) && (i == check.length)) ? true : false;
    result.diff = history[month+1].Close - history[month].Close;

    return result;
}