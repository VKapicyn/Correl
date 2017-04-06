var fs = require('fs');
var YahooFinanceAPI = require('yahoo-finance-data');
var api = new YahooFinanceAPI();

//выгружает историю с yahoo finance
exports.getHistory = new Promise((resolve, reject) => {
    let config = JSON.parse(fs.readFileSync('src/dataConfig.json', 'utf8'));
    let tickers = config.tickers;
    let tickersMass = config.tickers.split(';');
    let allData = [];
    let start = getStartDate();//получение начальной даты
    console.log(start);
    let finish = getEndDate();//получение конечной даты
    //console.log(finish);

    function recur(tickersMass, i){
        api.getHistoricalData(tickersMass[i], start, finish)
        .then(function(result) {
            allData.push(result.data);
            console.log(i);
            return i;
        }).done(function(i){
            if(i<tickersMass.length-1){
                i++;
                recur(tickersMass, i);
            }
            else
                {
                    resolve(sochet(allData, allData.length));
                }
        });
    }
    recur(tickersMass, 0);
});

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
            if (JSON.parse(fs.readFileSync('src/dataConfig.json', 'utf8')).price=='Медиана')
            {
                x = Number(x) + Number(one[i].Close);
                y = Number(y) + Number(two[i].Close);
                xy = Number(xy) + Number(one[i].Close)*Number(two[i].Close);
                xx = Number(xx) + Number(one[i].Close)*Number(one[i].Close);
                yy = Number(yy) + Number(two[i].Close)*Number(two[i].Close);
            }
            else{
                x = Number(x) + ((Number(one[i].High) - Number(one[i].Low))/2 + Number(one[i].Low));
                y = Number(y) + ((Number(two[i].High) - Number(two[i].Low))/2 + + Number(two[i].Low));
                xy = Number(xy) + ((Number(one[i].High) - Number(one[i].Low))/2 + Number(one[i].Low))*((Number(two[i].High) - Number(two[i].Low))/2 + + Number(two[i].Low));
                xx = Number(xx) + ((Number(one[i].High) - Number(one[i].Low))/2 + Number(one[i].Low))*((Number(one[i].High) - Number(one[i].Low))/2 + Number(one[i].Low));
                yy = Number(yy) + ((Number(two[i].High) - Number(two[i].Low))/2 + + Number(two[i].Low))*((Number(two[i].High) - Number(two[i].Low))/2 + + Number(two[i].Low));
            }
        }
    }
    let kf = (xy * counts - x * y) / Math.sqrt((xx * counts - x * x) * ((yy * counts - y * y)));
    let obj = {};
    obj.ftn = one[0].Symbol;
    obj.stn = two[0].Symbol;
    obj.kf = kf;
    //console.log(one[0].Symbol+' '+two[0].Symbol+' '+ kf);
    //console.log('--------');

    return obj;
}

function cointegration(one, two){
    
}

//загрузка конфига
exports.getConfig = function(){
    let config = JSON.parse(fs.readFileSync('src/dataConfig.json', 'utf8'));
    return config;
}

function getStartDate(){
    var period = JSON.parse(fs.readFileSync('src/dataConfig.json', 'utf8')).period;
	var date = new Date();console.log(date), console.log(date.getMonth())
	var day = date.getDate()>=10?date.getDate():'0'+date.getdate();
    var year = date.getFullYear();
    var month = date.getMonth() - Number(period) + 1;
    if (month<0) {
        month = Number(12) + Number(month); 
        year = year - 1
    }
    month = (month<10) ? '0'+month : month;
	return (year+'-'+month+'-'+day);
};

function getEndDate(){
	var date = new Date();
	var month;
	if (date.getMonth()>=9){
		month=date.getMonth()+1;
		month=date.getMonth()==13?'01':month;
	}
	else
		month='0'+(date.getMonth()+1);
	var day = date.getDate()>=10?date.getDate():'0'+date.getdate();
	return (date.getFullYear()+'-'+month+'-'+day);
};

module.exports.getEndDate = getEndDate;