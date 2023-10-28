



import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb';
import { getCatCountCollection } from '../../DB/collections.js';

import logError from '../../Errors/log-error.js';

const __filename = fileURLToPath(import.meta.url);

/**
 * @type {import('mongodb').Collection}
 */


/* REMOVE THIS LINE TO UNCOMMENT CODE///////////////////////////////////////////////////////

const catCountCollection = getCatCountCollection;

const leaderboardByCategory = async (category, page, perPage, user = null) => {
  try {
    // Set up skip, to skip to the correct "page" in the db
    const skip = (page - 1) * perPage;
    const cursor = catCountCollection
      .find() // find all documents whose totalUploads value is greater than one
      .sort() // sort descending by totalUploads
      .skip() // set the limit here
      .limit(); // how many perPage?

    // When not using a "findOne" method you have to turn the result into an array
    const sortedResults = await cursor.toArray();

    // Reshape the data as needed
    const reshapedResults = sortedResults.map((doc) => ({}));

    // Here we get the total amount of documents in order for the front end to set up pagination correct
    const totalEntries = await catCountCollection.countDocuments({
      [`pictureData.${category}`]: { $gt: 0 },
    });

    // Check if user is in the array
    let userRank;
    if (user) {
      // Check if user is in this page of results
      const userInArray = sortedResults.find(
        (doc) => doc.userId === new ObjectId(user._id),
      );
      // If the user is not in the result page get their place in the rankings
      if (!userInArray) {
        const findUsercursor = catCountCollection
          .find({ /*find by correct property*/: { $gt: 0 } })
          .sort({
            // sort descending by correct property
          });
        const sortedArry = await findUsercursor.toArray(); // turn the cursor into an array
        userRank = sortedArry.findIndex(
          (doc) => // find the user based on _id, remember there is a user._id property that is a string, needs to be an ObjectId
        );
      } else {
        // If they are in the array get their place in the ranking
        userRank = sortedResults.findIndex(
          (doc) =>  // getht the users index the array, you can user user._id and make sure to convert userId on the doc to a string
        );
      }
    }
    return {
      code: 200,
      data: {
        userRank: userRank === -1 ? -1 : userRank + 1, //Here we increase the users rank by 1 if it isnt -1, if it was -1 that means the user is not on the leaderboard
        totalEntries,
        leaderboard: reshapedResults,
      },
    };
  } catch (error) {
    console.log(error);
    logError(error, __filename, 'leaderboardByCategory');
    return {
      code: 500,
      data: { message: 'Internal Service Error' },
    };
  }
};

export default leaderboardByCategory;
