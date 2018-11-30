# Web Scraper

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- [![Packagist](https://img.shields.io/packagist/v/symfony/symfony.svg)]() -->

## Downloading
```bash
$ git clone https://github.com/mayankamencherla/web-scraper.git
```

## Reading List
> Some good reading guides to understand web crawlers
1. **[Web Crawler Architecture](https://www.microsoft.com/en-us/research/wp-content/uploads/2009/09/EDS-WebCrawlerArchitecture.pdf)**
2. **[Wikipedia](https://en.wikipedia.org/wiki/Web_crawler)**

## Setup Locally
> To get the app working locally, or to run test cases, follow the instructions below.
> After setting up the app, details on each API and how to use it can be found below in the **[API's available on this app](https://github.com/mayankamencherla/web-scraper#apis-available-on-this-app)** section.
> If any of the commands below are denied due to a permission error, please prepend a sudo to the command.

1. Navigate to the app's root directory

2. Run the following command to install all the dependencies:
```bash
$ npm install
```

3. Start the HTTP server:
```bash
$ npm run start
```
By default, the HTTP server is hosted on port 3000

## Run test cases:
```bash
$ npm run test
```

## API's available on this app
> This app supports 2 API's currently

1. GET <a href="http://localhost:3000" target="_blank">/</a>
   - Starts the crawler

2. GET <a href="http://localhost:3000/print" target="_blank">/print</a>
   - Print the site map of the crawled base url