const expect  = require('expect');
const request = require('supertest');
const url     = require('url');

const RequestQueue = require('../request-queue');
const Sitemap      = require('../sitemap');

const base = 'https://www.manutd.com';

const map = new Sitemap(base);
const rq  = new RequestQueue(map, base);

describe('Tests RequestQueue / Sitemap classes', () => {

    it ('Base host name is the domain name of base url', (done) => {

        expect(rq.getBaseDomainName()).toEqual('manutd');

        done();
    });

    it ('Undiscovered / uncrawled web links not in sitemap', (done) => {

        expect(rq.alreadyCrawled(base)).toEqual(false);

        expect(rq.alreadyDiscovered(base)).toEqual(false);

        done();
    });

    it ('Validation fails if url does not have base domain name', (done) => {

        expect(rq.validateUrlFormat(url.parse('https://www.manutdsds.com'))).toEqual(true);

        expect(rq.validateUrlFormat(url.parse('https://www.monzun.com'))).toEqual(false);

        done();
    });
});
