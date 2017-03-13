var login = require('../config').dbLogin;
var pass = require('../config').dbPass;
var adress = require('../config').dbIp;
//var url = 'mongodb://'+login+':'+pass+'@'+adress;
var url = 'mongodb://localhost:27017/Correl';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var db = mongoose.connect(url)
//var multer = require('multer');
//var upload = multer({dest: '../src/buffer'});
var conn = mongoose.connection;
//var fs = require('fs');
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var gfs = Grid(conn.db);


//module.exports.multer = multer;
module.exports.db = db;
//module.exports.upload = upload;
//module.exports.fs = fs;
module.exports.gfs = gfs; 
module.exports.url = url;



exports.updateHistory = function(){
    let start = '2016-09-01';
    let finish = '2017-04-10';

    //не работает потому что асинхронно, переделать на промис
    let historyData = require('./historyDataModel').getHistory(start, finish);
    
    historyModel.find().remove().then(function(result){
        let new_history = new historyModel;
        for(let i=0; i<historyData.length; i++){
            let obj = {};
            obj.ftn = historyData[i].ftn;
            obj.stn = historyData[i].stn;
            obj.kf = historyData[i].kf;
            new_history.history.push(obj);
        }
        new_history.update = new Date();
        new_history.save();
    }).then(function(){
        require('/app/models/monitroingModel').monitoring();
    });
}


var historySchema = new mongoose.Schema({
    update: mongoose.Schema.Types.Date,
    history: [{
        ftn: String,
        stn: String,
        kf: Number
    } ]
})

var historyModel = mongoose.model('histories', historySchema);
module.exports.historyModel = historyModel;
