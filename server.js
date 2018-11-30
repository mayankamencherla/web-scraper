const rp = require('request-promise');
const express = require('express');
const async = require('async');
const _ = require('lodash');
const url = require('url');
const cheerio = require('cheerio');
var request = require('request');

const base = 'https://www.monzo.com/';

const baseHostName = "monzo";

var app = express();

var crawled = [];
var inbound = [];

// Url mapped to all its child links
var adjacency = {};

app.get('/', (req, res) => {

    var makeRequest = (link, callback) => {
        var startTime = new Date().getTime();

        request(link, (error, response, body) => {
            console.log(`Making a request to ${link}`);

            var pageObject = {};

            pageObject.links = [];

            var endTime = new Date().getTime();
            var requestTime = endTime - startTime;
            pageObject.requestTime = requestTime;

            var $ = cheerio.load(body);
            pageObject.title = $('title').text();
            pageObject.url = link;

            $('a').each((i, elem) => {
              /*
               * insert some further checks if a link is:
               * valid
               * relative or absolute
               * check out the url module of node: https://nodejs.org/dist/latest-v5.x/docs/api/url.html
               */
              pageObject.links.push({linkText: $(elem).text(), linkUrl: elem.attribs.href})
            });

            callback(error, pageObject);
        });
    };

    var loop = (link) => {
        makeRequest(link, (err, pageObject) => {

            // Create an adjacency matrix and print the graph using breadth first search

            // console.log(`Callback with ${Object.keys(adjacency).length} keys`);

            // Just simply
            if (Object.keys(adjacency).length >= 30) {
                return;
            }

            crawled.push(link);

            adjacency[link] = [];

            // Avoid making http and https requests to same link
            var loopLinks = () => {
                // console.log(`${crawled.length} links have been crawled and there are ${inbound.length} still remaining`);

                if (inbound.length > 0) {
                    var nextLink = inbound[0];

                    inbound.splice(0, 1);

                    loop(nextLink);
                } else {
                    console.log('Done!');
                }
            }

            async.eachSeries(pageObject.links, (item, cb) => {
                var parsedUrl = url.parse(item.linkUrl);

                if (parsedUrl.protocol === 'https:' &&
                    parsedUrl.hostname &&
                    parsedUrl.hostname.includes(baseHostName) &&
                    !crawled.includes(item.linkUrl) &&
                    !inbound.includes(item.linkUrl)) {

                    // console.log(`Crawling... ${item.linkUrl}`);

                    adjacency[link].push(item.linkUrl);

                    inbound.push(item.linkUrl);
                }
                cb();
            },
            loopLinks);
        });
    };

    loop(base);
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
