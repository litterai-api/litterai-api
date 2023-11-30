import CategoryCount from '../../models/CategoryCount.js';

const categoryLeaderboardService = async (category, page, perPage, user) => {
    // TODO: Can we run only make one call to the db by having two option.
    // if a user is logged in
    //    run a facet so we can get the leaderboard and the user's position at the same time
    //    const { leadeboard, userRank } = await CategoryCount.getLeadboardByCategory()
    //    or we can just add an option to take a user a user in the method below
    // else
    //    just build the leaderboard with the method below
    const leaderboardPage = await CategoryCount.getLeaderboardByCategory(
        category,
        page,
        perPage,
    );

    // TODO: If we accomplisth the above todo we can remove all of this
    let userRank;
    if (user) {
        // Check if user is in this page of the leaderboard
        const userInLeaderboardPage = leaderboardPage.leaderboard.find(
            (doc) => doc.username === user.username,
        );

        // If the user is not in this page of the leaderboard get their ranking from the full list
        if (!userInLeaderboardPage) {
            const fullLeaderboard =
                await CategoryCount.getLeaderboardByCategory();
            userRank = fullLeaderboard.leaderboard.findIndex(
                (doc) => doc.username === user.username,
            );
        } else {
            // If they are in this page of the leaderboard get their ranking
            userRank = leaderboardPage.leaderboard.findIndex(
                (doc) => doc.username === user.username,
            );
        }
    }

    if (userRank > -1) {
        userRank += 1;
    }

    return {
        category,
        userRank,
        totalEntries: leaderboardPage.totalEntries,
        leaderboard: leaderboardPage.leaderboard,
    };
};

export default categoryLeaderboardService;
