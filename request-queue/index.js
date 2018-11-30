const axios              = require('axios');
const cheerio            = require('cheerio');
const url                = require('url');
const { getAbsoluteUrl } = require('../helpers');

/**
 * Maintains list of urls that have been crawled
 * and list of urls that need to be crawled
 */
class RequestQueue {
    constructor(sitemap, base) {
        this.crawled = [];
        this.discovered = [];
        this.sitemap = sitemap;
        this.base = base;
    }

    /**
     * Return whether the link is valid
     * @param link
     */
    validateUrl(link) {
        if (link === undefined) return;

        var parsed = url.parse(link);

        return this.validateUrlFormat(parsed) &&
               !this.alreadyCrawled(link) &&
               !this.alreadyDiscovered(link);
    }

    /**
     * Fetches the children of a parent url
     * @param link
     * @param callback
     */
    async fetchChildren(link) {

        try {

            const response = await axios.get(link);

            console.log(`Fetching the children of ${link}`);

            var $ = cheerio.load(response.data);

            $('a').each((i, elem) => {
                var url = getAbsoluteUrl(elem.attribs.href, this.base);

                if (!this.validateUrl(url)) return;

                this.discovered.push(url);

                this.sitemap.addChild(link, url);
            });
        } catch (e) {
            console.log(`Unable to fetch children for ${link}`);
        }
    }

    /**
     * Crawls a link
     * @param link
     */
    async crawlLink(link) {
        if (this.alreadyCrawled(link)) return;

        this.crawled.push(link);

        this.sitemap.addParent(link);

        await this.fetchChildren(link);
    }

    /**
     * Sets up the crawler job queue
     * @param limit
     */
    async crawl(limit) {
        this.discovered.push(this.base);

        while (this.discovered.length > 0 && this.sitemap.numCrawled() <= limit) {
            var url = this.discovered[0];

            this.discovered.splice(0, 1);

            await this.crawlLink(url);
        }

        this.clear();

        console.log(`We are done with crawling the site: ${this.base}`);
    }

    /**
     * Clears the request and crawled queues
     */
    clear() {
        this.discovered = [];
        this.crawled = [];
    }

    /**
     * Returns if the link is already crawled
     * @param link
     */
    alreadyCrawled(link) {
        return this.sitemap.parentInMap(link);
    }

    /**
     * Returns if the link is already discovered
     * @param link
     */
    alreadyDiscovered(link) {
        return this.discovered.includes(link);
    }

    /**
     * Returns the base url's host name
     */
    getBaseHostName() {
        var parsed = url.parse(this.base);

        return parsed.hostname;
    }

    /**
     * Modify base
     * @param base
     */
    setBase(base) {
        this.base = base;
    }

    /**
     * Returns whether the url format is valid
     * @param parsed
     */
    validateUrlFormat(parsed) {
        return parsed.protocol === 'https:' &&
               parsed.hostname &&
               parsed.hostname.includes(this.getBaseHostName());
    }
}

module.exports = RequestQueue;