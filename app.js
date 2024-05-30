const express = require('express')
const db= require('./config/db')
const dotenv = require("dotenv")
const userRoutes = require("./routes/user_routes")
const quipRoutes = require("./routes/quip_routes")
const rateLimit = require('express-rate-limit');
dotenv.config()


db(process.env.DATABASE_URL);
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
  });

const app = express()
const port = process.env.PORT || 3000
app.use(express.json()); 
app.use(limiter);
app.use("/api/user/",userRoutes);
app.use("/api/quip/",quipRoutes); 
app.get('/', (req, res) => res.send('Welcome to Quippy'))
app.listen(port, () => console.log(`listening on port ${port}!`))