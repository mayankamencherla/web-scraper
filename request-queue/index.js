const axios              = require('axios');
const cheerio            = require('cheerio');
const url                = require('url');
const { getAbsoluteUrl } = require('../helpers');
const Workflow           = require('../workflow');
const Configuration      = require('../configuration');

const config = new Configuration();

const concurrency = config.get('CONCURRENCY') || 1;

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

        this.setWorkflow();
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

            // TODO: Check if there's a better async library
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

        // TODO: What if this fails mid way?
        // Add this as a task in the workflow builder
        await this.fetchChildren(link);
    }

    /**
     * Gets the tuples of urls that we want to crawl
     * @param remaining
     * @return urls
     */
    getUrlTuples(remaining) {
        var len = Math.min(remaining, Math.min(concurrency, this.discovered.length));

        var urls = this.discovered.slice(0, len);

        this.discovered.splice(0, len);

        return urls;
    }

    /**
     * Sets up the crawler job queue
     * @param limit
     */
    async crawl(limit) {
        this.discovered.push(this.base);

        while (this.discovered.length > 0 && this.sitemap.numCrawled() < limit) {

            var remaining = limit - this.sitemap.numCrawled();

            var urls = this.getUrlTuples(remaining);

            // Do 3 retries
            // If 1 concurrent request dies, and the others succeed,
            // the parent urls would have been added to the site map
            // Therefore, we would not be running those requests again
            // Only the failed request will be retried in the retry logic
            this.workflow.addParallelTask(urls, 'crawlLink', 3);

            await this.workflow.runTasks();
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
    getBaseDomainName() {
        var parsed = url.parse(this.base);

        return parsed.hostname.split('.')[1];
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
               parsed.hostname.includes(this.getBaseDomainName());
    }

    /**
     * Creates the workflow and sets the dependency object to be this object
     */
    setWorkflow() {
        // TODO: Refactor this into a Build pattern
        // TODO: Remove setDep method
        this.workflow = new Workflow();

        this.workflow.setDependency(this);
    }
}

module.exports = RequestQueue;