const express      = require('express');
const RequestQueue = require('./request-queue');
const Sitemap      = require('./sitemap');

const base = 'https://www.monzo.com';

var app   = express();
const map = new Sitemap(base);
const rq  = new RequestQueue(map, base);


app.get('/', async (req, res) => {
    await rq.crawl(20);

    map.print();
});

app.get('/print', (req, res) => {
    map.print();
});

app.listen('3000', () => {
    console.log('App hosted on 3000');
});

module.exports = app;
