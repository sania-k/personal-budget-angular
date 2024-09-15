const express = require('express');
const app = express();
const port = 3456;

app.use('/', express.static('public'));

const budget = [
    {
        title: 'Eat out',
        budget: 70
    },
    {
        title: 'Rent',
        budget: 850
    },
    {
        title: 'Groceries',
        budget: 120
    }
]

app.get('/hello', (req, res) => {
    res.send('Hello World! :D');
});

app.get('/budget', (req, res) => {
    res.json(budget);
});



app.listen(port, () => {
    console.log(`Example app listening @ http://localhost:${port}`)
});
