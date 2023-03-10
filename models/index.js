const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const db = {}
const config = require('config')

// in validator node dont need store db info
if (!config.checkTxOnChain) {
    mongoose.Promise = global.Promise
    mongoose.set('useCreateIndex', true)
    mongoose.connect(config.get(`db.uri.${config.caspernetwork}`), {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        },
        (err) => {
            if (err) {
                console.error('Mongodb Connection error!!!')
                process.exit()
            }
        })

// import all file in this dir, except index.js
    fs.readdirSync(__dirname)
        .filter(function (file) {
            return (file.indexOf('.') !== 0) && (file !== 'index.js')
        })
        .forEach(function (file) {
            var model = require(path.join(__dirname, file))
            db[model.modelName] = model
        })

    db.mongoose = mongoose
}
module.exports = db
