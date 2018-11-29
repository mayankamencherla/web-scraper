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

            // console.log(`Callback with ${pageObject.links.length} links`);

            crawled.push(link);

            // Avoid making http and https requests to same link
            var loopLinks = () => {
                var nextLinks = _.difference(_.uniq(inbound), crawled);

                // console.log(`${crawled.length} links have been crawled and there are ${nextLinks.length} still remaining`);

                if (nextLinks.length > 0) {
                    loop(nextLinks[0]);
                } else {
                    console.log('Done!');
                }
            }

            async.eachSeries(pageObject.links, (item, cb) => {
                var parsedUrl = url.parse(item.linkUrl);

                if (parsedUrl.hostname && parsedUrl.hostname.includes(baseHostName)) {
                    inbound.push(item.linkUrl);
                }
                cb();
            },
            loopLinks);
        });
    };

    loop(base);
});

app.listen('3000', () => {
    console.log('App hosted on 3000');
});

module.exports = app;
