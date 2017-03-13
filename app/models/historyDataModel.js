var fs = require('fs');
var YahooFinanceAPI = require('yahoo-finance-data');
var api = new YahooFinanceAPI();

//!!!! Переделать как промис
//выгружает историю с yahoo finance
exports.getHistory = function (start, stop){
    let config = require('./historyDataModel').getConfig();
    let tickers = config.tickers;
    let tickersMass = config.tickers.split(';');
    let allData = [];
    
    function recur(tickersMass, i){
        api.getHistoricalData(tickersMass[i], start, stop)//'2016-09-01', '2017-04-10')
        .then(function(result) {
            allData.push(result.data);
            return i;
        }).done(function(i){
            if(i<tickersMass.length-1){
                i++;
                recur(tickersMass, i);
            }
            else
                {
                    return sochet(allData, allData.length);
                }
        });
    }

    recur(tickersMass, 0);
};

//вызывает рассчет корреляции для всех сочетаний
function sochet(data, length){
    let correlData = [];
    for(let i=0; i<=length; i++){
        for(let j=i+1; j<=length-1; j++){
            correlData.push(correl(data[i], data[j]));
        }
    }
    return correlData;
}

//рассчет корреляции
function correl(one, two){
    let x=0,y=0,xx=0,xy=0,yy=0;
    let counts = (one.length < two.length) ? one.length : two.length;

    if (counts!=0)
    {
        for (let i=0; (i<counts); i++)
        {
            x = Number(x) + Number(one[i].Close);
            y = Number(y) + Number(two[i].Close);
            xy = Number(xy) + Number(one[i].Close)*Number(two[i].Close);
            xx = Number(xx) + Number(one[i].Close)*Number(one[i].Close);
            yy = Number(yy) + Number(two[i].Close)*Number(two[i].Close);
        }
    }
    let kf = (xy * counts - x * y) / Math.sqrt((xx * counts - x * x) * ((yy * counts - y * y)));
    //console.log(one[0].Symbol+' '+two[0].Symbol+' '+ kf);
    //console.log('--------');

    return kf;
}

//загрузка конфига
exports.getConfig = function(){
    let config = JSON.parse(fs.readFileSync('src/dataConfig.json', 'utf8'));
    return config;
}