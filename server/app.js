const express = require('express');
const authorRouter = require('./controllers/authorController');
const categoryRouter = require('./controllers/categoryController');
const app = express();
const bodyParser = require('body-parser');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const port = 3500;

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.get("/", (req, res) => {
    res.send("Express");
})

app.use(bodyParser.json());

app.use('/authors', authorRouter);
app.use('/categories', categoryRouter);

app.listen(port, () => {
    console.log(`Running on ${port}`);
})