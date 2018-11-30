/**
 * Maintains a site map containing a parent tree
 * relationship between parent sites and children
 */
 class Sitemap {
    constructor() {
        this.map = {};
    }

    /**
     * Adds a parent to the sitemap
     * @param link
     */
    addParent(link) {
        this.map[link] = [];
    }

    /**
     * Returns whether the parent is in the map
     * @param parent
     */
    parentInMap(parent) {
        return this.map.hasOwnProperty(parent);
    }

    /**
     * Adds a child to the parent
     * @param parent
     * @param child
     */
    addChild(parent, child) {
        if (!this.parentInMap(parent)) this.addParent(parent);

        this.map[parent].push(child);
    }
 }

 module.exports = Sitemap;