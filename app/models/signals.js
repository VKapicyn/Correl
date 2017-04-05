//ao
exports.one = function(history, date){
    //console.log(ao(history, date + 2), ao(history, date + 1))
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
    if (ema(ticker, date + 1) < ema(ticker, date))
        return true;
    else
        return false;
}

function sma(ticker, bars, start, type){
    if (bars+start <= ticker.length)
    {
        let sum = 0;
        for(let i = 1+start; i <= bars+start; i++){
            if (type == 'median')
                sum += (ticker[i].High+ticker[i].Low)/2;
            if (type == 'standart')
                sum += ticker[i].Close;
            if (type == 'ao')
                sum += ao(ticker, i);
        }
        return sum/bars;
    }
    else
        return 0;
}

module.exports.sma = sma;

function ao(ticker, data){
    if (ticker.length > 34)
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
    return ao(ticker,data)-b;
}

module.exports.ac = ac;

//доделать
function ema(ticker, data){
    let sr = 0, alpha = 0;
    for(let i = 1+data; i < 26+data; i++){
        sr += ticker[i].Close;
    }
    sr = sr/26;
    alpha = 2 / 27;
    return alpha*ticker[27+data].Close+Number((1-alpha))*sr;
}

module.exports.ema = ema;