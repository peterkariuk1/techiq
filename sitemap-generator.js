// sitemap-generator.js (ESM style)
import pkg from 'react-router-sitemap';
const { Sitemap } = pkg;

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routes = [
  '/',
  '/product',
  '/all-products',
  '/product/:id',
  '/checkout',
  '/orders',
  '/order-success',
  '/login',
  '/register',
  '/reset',
  '/admin'
];

function generateSitemap() {
  return new Sitemap({ baseUrl: 'https://www.loriskenya.com', routes })
    .build('public/manifest.json')
    .save(path.resolve(__dirname, 'public', 'sitemap.xml'));
}

generateSitemap();
