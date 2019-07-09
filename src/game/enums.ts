export enum PrizeType {
    Gold = 1,
    Money = 2
}
export enum ShareType {
    InviteFriend = 1,
    GroupPK = 2,
    GroupRank = 3
}

export enum RectCorner {
    RectCornerTopLeft = 1 << 0,
    RectCornerTopRight = 1 << 1,
    RectCornerBottomLeft = 1 << 2,
    RectCornerBottomRight = 1 << 3,
    RectCornerAllCorners = 15
}

export enum GameEntryType {
    /**好友对战 */
    Friend = 1,
    /**匹配场次 */
    Match = 2,
    /**天梯赛 */
    Ladder = 3,
    /**红包赛 */
    Arena = 4,
    /**人满开赛 */
    Full = 5
}

export enum SocketURLType {
    TIMING = 'timing_url',
    GAME = 'game_url'
}

export enum RankingType {
    /**高分榜 */
    Score = 1,
    /**天梯榜 */
    Ladder = 2,
    /**胜局榜 */
    WIN = 8
}