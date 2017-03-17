class sector{
    constructor(name){
        this.name = name;
    }

    setTable(object){
        this.table.push(object);
    }

    getTable(){
        return this.table;
    }

    getTickers(){
        
        return new Promise((resolve, reject) => {
            console.log('вызвали');
            resolve(['aapl','aame','abcd'])
            
        });
    }
}

exports.getSectors = function(){
    //возвращаем список секторов из БД
    return ['economy'];
}

module.exports.sector = sector;