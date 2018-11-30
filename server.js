const express      = require('express');
const RequestQueue = require('./request-queue');
const Sitemap      = require('./sitemap');
const validUrl     = require('valid-url');

var app   = express();

app.get('/', async (req, res) => {

    if (req.query.hasOwnProperty('url') && validUrl.isUri(req.query.url)) {
        const base = req.query.url;

        const map = new Sitemap(base);
        const rq  = new RequestQueue(map, base);

        await rq.crawl(20);

        map.print();
    } else {
        console.log(`User input url invalid`);

        res.status(400);
    }
});

app.listen('3000', () => {
    console.log('App hosted on 3000');
});

module.exports = app;
