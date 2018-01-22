export declare class TwitterCrawler {
    private client;
    private entityManager;
    constructor();
    searchTweets(geocode: string, maxId?: number): Promise<number>;
    private parseTweets(tweets);
    private handleUser(tweet, userId);
    private handleTimeline(userId, sinceId);
    private parseTimeline(userId, tweets, ids);
}
