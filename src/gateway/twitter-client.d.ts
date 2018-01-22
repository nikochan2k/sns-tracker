export declare class TwitterClient {
    private client;
    constructor();
    searchTweets(geocode: string, maxId?: number): Promise<any>;
    getUserTimeline(userId: number, sinceId?: number, maxId?: number): Promise<any[]>;
}
