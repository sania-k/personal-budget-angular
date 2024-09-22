const express = require('express');
const cors = require('cors');
const budget = require('./budget.json');
const app = express();
const port = 3456;

app.use(cors);

app.get('/budget', (req, res) => {
    res.json(budget)
});


app.listen(port, () => {
    console.log(`API served @ http://localhost:${port}`)
});
