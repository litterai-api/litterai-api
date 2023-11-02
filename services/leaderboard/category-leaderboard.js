import CategoryCount from '../../models/CategoryCount/CategoryCount.js';

const categoryLeaderboardService = async (category, page, perPage, user) => {
  const leaderboardPage = await CategoryCount.getLeaderboardByCategory(
    category,
    page,
    perPage,
  );

  let userRank;
  if (user) {
    // Check if user is in this page of the leaderboard
    const userInLeaderboardPage = leaderboardPage.leaderboard.find(
      (doc) => doc.username === user.username,
    );

    // If the user is not in this page of the leaderboard
    if (!userInLeaderboardPage) {
      const fullLeaderboard = await CategoryCount.getLeaderboardByCategory();
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