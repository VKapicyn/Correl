var express = require('express');
var bodyParser = require('body-parser');
var dbModel = require('./app/models/db-model');
var app = express();
var session = require('express-session')



/*app.use(session({
  secret: require('./app/config.js').secret,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ 
    url: require('./app/models/db-model').url
  })
}));*/

/*let timeId = setInterval(function(){
  let tt = require('./app/models/db-model').updateHistory;
  console.log('Обновил');
  setTimeout(require('./app/models/monitoringModel').monitoring,20000);
  },60000);*/

//require('./app/models/monitoringModel').monitoring();
//require('./app/models/db-model').updateHistory();


app.use(bodyParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('./src/buffer'));                                                                
app.use(bodyParser.json());
app.use(express.static(__dirname + '/src'));                                                                                                    
app.set('views', './app/views');
app.set('view engine', 'jade');


app.get('/', require('./app/controllers/main').mainPage);
app.post('/select', require('./app/controllers/portfel').selection);
app.get('/monitoring/:sort', require('./app/controllers/main').resultJson)
app.get('/settings', require('./app/controllers/portfel').settings);
app.get('/update', require('./app/controllers/portfel').update);
app.get('/show', require('./app/controllers/show').getPortfel);
app.post('/dataconfig', require('./app/controllers/show').portfelConfig)
app.post('/result', require('./app/controllers/main').setConfig);
app.post('/email', require('./app/controllers/main').setEmail);
app.post('/addInIndex', require('./app/models/index').addInIndex);

app.get('/test', function(req, res){
  require('./app/models/stock').historyMonth.findOne({sector:'conglomerats'}).then(function(result){
    result.tickers.map(x => 
    {if(x.name == 'SPLP')
      { let mass = [];
        x.history.map(day => {
          let obj = {};
          obj.Date = day.Date,
          obj.Close = day.Close,
          obj.Open = day.Open,
          obj.High = day.High,
          obj.Low = day.Low,
          mass.push(obj);
        })
        res.render('test', {result: mass});
      }
    })
  })
 
})

app.listen(require('./app/config.js').port);
console.log('Сервер работает');                                                                                                                                                              