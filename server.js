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
app.get('/monitoring/:sort', require('./app/controllers/main').resultJson)
app.post('/result', require('./app/controllers/main').setConfig);
app.post('/email', require('./app/controllers/main').setEmail);


app.listen(require('./app/config.js').port);
console.log('Сервер работает');                                                                                                                                                              