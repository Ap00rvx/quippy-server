const express = require('express')
const db= require('./config/db')
const dotenv = require("dotenv")
const userRoutes = require("./routes/user_routes")
const quipRoutes = require("./routes/quip_routes")
dotenv.config()


db(process.env.DATABASE_URL);


const app = express()
const port = process.env.PORT || 3000
app.use(express.json()); 
app.use("/api/user/",userRoutes);
app.use("/api/quip/",quipRoutes); 
app.get('/', (req, res) => res.send('Welcome to Quippy'))
app.listen(port, () => console.log(`listening on port ${port}!`))