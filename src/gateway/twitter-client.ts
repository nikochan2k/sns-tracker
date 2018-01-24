import * as Twitter from 'twitter';
import { key } from '../key';

export class TwitterClient {

  private client: any;

  constructor() {
    this.client = new Twitter(key);
  }

  public async searchTweets(geocode: string, maxId?: number) {
    const query: {} = {
      geocode: geocode,
      result_type: 'recent',
      locale: 'ja',
      max_id: (maxId ? maxId : undefined),
      count: 100
    };

    return new Promise<any>((resolve, reject) => {
      this.client.get('/search/tweets.json', query, async (error, tweets) => {
        if (!error) {
          resolve(tweets);
        } else {
          reject(error);
        }
      });
    });
  }

  public async getUserTimeline(userId: number, sinceId?: number, maxId?: number) {
    const query: any = {
      user_id: userId,
      since_id: (sinceId ? sinceId : undefined),
      max_id: (maxId ? maxId : undefined),
      count: 200,
      trim_user: true,
      exclude_replies: true,
      include_rts: false
    };

    return new Promise<any[]>((resolve, reject) => {
      this.client.get('/statuses/user_timeline.json', query, (error, timeline) => {
        if (!error) {
          resolve(timeline);
        } else {
          reject(error);
        }
      });
    });
  }
}
