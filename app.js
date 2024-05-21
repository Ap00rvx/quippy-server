const express = require('express')
const db= require('./config/db')
const dotenv = require("dotenv")
const userRoutes = require("./routes/user_routes")
dotenv.config()


db(process.env.DATABASE_URL);


const app = express()
const port = 8080
app.use(express.json()); 
app.use("/api/user/",userRoutes);
app.get('/', (req, res) => res.send('Welcome to Quippy'))
app.listen(port, () => console.log(`listening on port ${port}!`))