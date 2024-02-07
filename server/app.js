const express = require('express');
const authorRouter = require('./controllers/authorController');
const app = express();
const bodyParser = require('body-parser');
const port = 3500;

app.get("/", (req, res) => {
    res.send("Express");
})

app.use(bodyParser.json());

app.use('/authors', authorRouter);

app.listen(port, () => {
    console.log(`Running on ${port}`);
})