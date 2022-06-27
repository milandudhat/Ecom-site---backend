const express = require('express')


const errorMiddleware = require('./middleware/error')
const app = express()
const cookieParser = require("cookie-parser")

app.use(express.json())
app.use(cookieParser());


const product = require('./routes/productRoute')
const user = require('./routes/useRoute')
// const order = require('./routes/orderRoute')


const order = require("./routes/orderRoute")

app.use("/api/v1" , product)
app.use("/api/v1" , user)
app.use("/api/v1" , order)



app.use(errorMiddleware)

module.exports = app