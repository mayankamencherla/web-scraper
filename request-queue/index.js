/**
 * Maintains list of urls that have been crawled
 * and list of urls that need to be crawled
 */
class RequestQueue {
    constructor(sitemap) {
        this.crawled = [];
        this.discovered = [];
        this.sitemap = sitemap;
    }

    /**
     * Crawls a link
     * @param link
     */
    crawl(link) {
        if (this.alreadyCrawled(link)) return;

        this.crawled.push(link);

        this.sitemap.addParent(link);
    }

    /**
     * Returns if the link is already crawled
     * @param link
     */
    alreadyCrawled(link) {
        return this.crawled.includes(link);
    }

    /**
     * Returns if the link is already discovered
     * @param link
     */
    alreadyDiscovered(link) {
        return this.discovered.includes(link);
    }
}

module.exports = RequestQueue;