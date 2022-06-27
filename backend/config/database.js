const mongoose = require('mongoose')



const DataBase = () =>{
    mongoose.connect(process.env.DB_URI , ).then((data)=>{
        console.log(`DB Connected `);
    }).catch((err)=>{
        console.log(err);
    })
}

module.exports = DataBase