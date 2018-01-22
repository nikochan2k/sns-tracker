import { sleep, calcGeohash } from '../util';
import { EntityManager } from 'typeorm';
import { OrmManager } from 'typeorm-typedi-extensions';
import { TwitterClient } from '../gateway/twitter-client';
import { TwitterPost } from '../entity/twitter-post';
import { TwitterText } from '../entity/twitter-text';
import { TwitterUser } from '../entity/twitter-user';

interface Ids {
  maxId: number;
  minId: number;
}

export class TwitterCrawler {

  private client: TwitterClient;

  @OrmManager()
  private entityManager: EntityManager;

  constructor() {
    this.client = new TwitterClient();
  }

  public async searchTweets(geocode: string, maxId?: number) {
    const tweets = await this.client.searchTweets(geocode, maxId);
    if (!tweets || !tweets.statuses) {
      return 0;
    }

    return this.parseTweets(tweets.statuses);
  }

  private async parseTweets(tweets: any[]) {
    let minId = 0;
    for (const tweet of tweets) {
      const id = tweet.id;
      if (!minId || id < minId) {
        minId = id - 1;
      }

      const geo: any = tweet.geo;
      if (!geo) {
        continue;
      }

      const userId = <number>tweet.user.id;
      await this.entityManager.transaction(async () => {
        await this.handleUser(tweet, userId);
      });
    }

    return minId;
  }

  private async handleUser(tweet: any, userId: number) {
    let sinceId = 0;
    let user = await this.entityManager.findOneById(TwitterUser, userId);
    if (!user) {
      user = new TwitterUser();
      user.id = userId;
      user.screenName = <string>tweet.user.screen_name;
      user.name = <string>tweet.user.name;
      user.maxId = 0;
      await this.entityManager.save(TwitterUser, user);
    } else {
      sinceId = user.maxId + 1;
    }

    const maxId = await this.handleTimeline(userId, sinceId);
    if (!maxId) {
      return;
    }

    const partial: Partial<TwitterUser> = {};
    partial.maxId = maxId;
    await this.entityManager.updateById(TwitterUser, userId, partial);
  }

  private async handleTimeline(userId: number, sinceId: number) {
    const ids: Ids = { maxId: 0, minId: 0 };
    let tweets: any[];
    let saved = 0;
    do {
      tweets = await this.client.getUserTimeline(userId, sinceId, ids.minId);
      saved = await this.parseTimeline(userId, tweets, ids);
      console.log(`userId: ${userId}, ${saved} records saved`);
      await sleep(3000);
    } while (0 < saved);

    return ids.maxId;
  }

  private async parseTimeline(userId: number, tweets: any[], ids: Ids) {
    let saved = 0;
    for (const tweet of tweets) {
      const id = <number>tweet.id;
      if (!ids.maxId || ids.maxId < id) {
        ids.maxId = id;
      }
      if (!ids.minId || id < ids.minId) {
        ids.minId = id;
      }

      let post = await this.entityManager.findOneById(TwitterPost, id);
      if (post) {
        continue;
      }

      const created: number = new Date(tweet.created_at).getTime();
      if (isNaN(created)) {
        continue;
      }

      const geo = tweet.coordinates || tweet.geo;
      if (!geo || !geo.coordinates) {
        continue;
      }
      const coordinates = <number[]>geo.coordinates;

      post = new TwitterPost();
      post.id = id;
      post.userId = userId;
      post.created = created;
      post.lng = coordinates[0];
      post.lat = coordinates[1];
      post.geohash = calcGeohash(post.lat, post.lng);
      await this.entityManager.save(TwitterPost, post);

      const text = new TwitterText();
      text.id = id;
      text.content = tweet.text;
      await this.entityManager.save(TwitterText, text);

      ++saved;
    }

    return saved;
  }
}
