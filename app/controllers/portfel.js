let Stock = require('../models/stock').stock;
let Sector = require('../models/sector').sector;

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
                //получаем историю для каждой акции
                stock.getHistory().then(function(history, err){
                    //проверка на прохождение условий последнего месяца
                    if (check_signals(req.params, history, 0).truth){
                        let table_el = {};
                        table_el.ticker = stock.ticker;
                        table_el.result = [];
                        //проверяем всю историю и добавляем акцию в таблицу сектора
                        for(let i=1; i<history.length; i++){
                            let result = check_signals(req.params, history, i)
                            if (result.truth)
                                table_el.result.push(result);
                        }
                        //добавляем подходящую акцию в сектор
                        setTable(table_el);
                    }
                }); 
            });
        });
    });
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
    result.date = history[month].date;
    result.diff = history[month+1] - history[month];

    return result;
}