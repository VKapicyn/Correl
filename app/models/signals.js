//ao
exports.one = function(history, date){
    if (ao(history, date + 2) > ao(history, date + 1))
        return true;
    else
        return false;
}

exports.two = function(history, date){
    if (ao(history, date + 1) < ao(history, date + 0))
        return true;
    else
        return false;
}

exports.three = function(history, date){
    if (ac(history, date) < 0)
        return true;
    else
        return false;
}

exports.four = function(history, date){
    //console.log(ema(history, date + 1), ema(history, date))
    if (ema(history, date + 1) < ema(history, date))
        return true;
    else
        return false;
}

function sma(ticker, bars, start, type){
    if (bars+start <= ticker.length)
    {
        try{
        let sum = 0;
        for(let i = 1+start; i <= bars+start; i++){
            if (type == 'median')
                sum += Number((Number(ticker[i].High)+Number(ticker[i].Low))/2);
            if (type == 'standart')
                sum += ticker[i].Close;
            if (type == 'ao')
                sum += ao(ticker, i);
        }
        return sum/bars;
        }
        catch(e){
            return 0;
        }
    }
    else
        return 0;
}

module.exports.sma = sma;

function ao(ticker, data){
    if (ticker.length > 35)
        return (sma(ticker, 5, data, 'median') - sma(ticker, 34, data, 'median'));
    else 
        return 0;
}

module.exports.ao = ao;

function ac(ticker, data){
    
    let b=0;
    for(let i=data; i<(5+data); i++){
        b +=ao(ticker,i);
    }
    b = b/5;
    a = ao(ticker,data);
    return a - b;
}

module.exports.ac = ac;

//доделать
function ema(ticker, data){
    if(ticker.length > 27+data){
        let sr = 0, alpha = 0;
        for(let i = 1+data; i <= 26+data; i++){
            sr += Number(ticker[i].Close);
            //console.log(sr);
        }
        sr = sr / 26;
        alpha = 2 / 27;
         //console.log(alpha*ticker[27+data].Close+(Number((1-alpha))*sr));
         //cosole.log();
        return alpha*ticker[27+data].Close+(Number((1-alpha))*sr);
       
    }
    else 
        return 0;
}

module.exports.ema = ema;