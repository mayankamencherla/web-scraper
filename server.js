const express = require('express');
const RequestQueue = require('./request-queue');
const Sitemap = require('./sitemap');

const base = 'https://www.monzo.com';

const baseHostName = "monzo";

var app   = express();
const map = new Sitemap();
const rq  = new RequestQueue(map, base);


app.get('/', async (req, res) => {
    await rq.crawl();
});

app.get('/print', (req, res) => {

    var printAdjList = (link, spaces) => {

        console.log('-'.repeat(spaces*3) + link);

        if (!adjacency.hasOwnProperty(link)) return;

        for (var child of adjacency[link]) {
            printAdjList(child, spaces+1);
        }
    }

    printAdjList(base, 0);
});

app.listen('3000', () => {
    console.log('App hosted on 3000');
});

module.exports = app;
