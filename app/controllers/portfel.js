let Stock = require('../models/stock').stock;
let Sector = require('../models/sector').sector;
let historyMonth = require('../models/stock').historyMonth;

exports.selection = function(req, res){
    let sectors_name = require('../models/sector').getSectors();
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
    historyMonth.find().then(function(result){
        //console.log(result);
        if (result.length!=0)
        {
            res.render('settings', {
                lastUpdate: result[result.length-1].history[0].Date,
                count: result.length
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

exports.update = function(req, res){
    let sectors_name = require('../models/sector').getSectors();
    let sectors = [];
    sectors_name.map(sector_name => sectors.push(new Sector(sector_name)));
    sectors.map(sector => {
        let stocks = [];
        sector.getTickers().then(function(tickers, err){
            let ok_stocks = [];
            tickers.map(ticker => {
                stocks.push(new Stock(ticker));
            });
            var error = 0, complete = 0;
            stocks.map(stock => {
                    stock.setHistory(stock.getTicker()).then(function(result, err){
                        if (result)
                            complete++;
                        if (error)
                            error++;
                    });
            });
        });
    });
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