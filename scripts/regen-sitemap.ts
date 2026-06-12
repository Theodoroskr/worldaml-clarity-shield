import { sitemapGenerator } from "../plugins/generate-sitemap";
const plugin: any = sitemapGenerator();
plugin.configResolved({ root: process.cwd() });
plugin.buildStart();
