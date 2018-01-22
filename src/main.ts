import { Container } from 'typedi';
import { createConnection, useContainer } from 'typeorm';
import { sleep } from './util';
import { TwitterCrawler } from './application/twitter';
import 'reflect-metadata';

let geocode = '35.222,139.021,5km';
if (3 <= process.argv.length) {
  geocode = process.argv[2];
} else {
  // process.exit(1);
}

useContainer(Container);
createConnection({
  type: 'sqlite',
  database: `${__dirname}/sns.sqlite`,
  entities: [`${__dirname}/entity/*.js`],
  logging: ['error', 'warn']
}).then(async (con) => {
  await con.query('PRAGMA journal_mode = WAL');
  await con.synchronize(false);
  await main();
}).catch((reason) => {
  console.error(reason);
});

async function main() {
  const twitter = Container.get(TwitterCrawler);
  let maxId = await twitter.searchTweets(geocode);

  return;
  while (0 < maxId) {
    maxId = await twitter.searchTweets(geocode, maxId);
    await sleep(3000);
  }
}
