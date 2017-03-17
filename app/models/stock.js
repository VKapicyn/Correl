class stock{
    constructor(ticker){
        this.ticker = ticker;
    }

    getHistory(){
        return new Promise((resolve, reject) =>{
            resolve(this.ticker);
        })
    }
}


module.exports.stock = stock;
