/* eslint-disable no-unused-expressions */
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';
import chai from 'chai';
import PhotoInfo from '../../models/PhotoInfo.js';
import CategoryCount from '../../models/CategoryCount.js';
import User from '../../models/User.js';
import { closeDB } from '../../DB/db-connection.js';

const { expect } = chai;

const getRandomCategory = () => {
  const categories = [
    'paper',
    'cardboard',
    'compost',
    'metal',
    'glass',
    'plastic',
    'trash',
    'other',
    'unknown',
  ];
  const randomNumber = Math.floor(Math.random() * categories.length);
  return categories[randomNumber];
};

describe('PhotoInfo Model', () => {
  let mongoServer;
  let client;
  let db;
  let newUser;
  let newPhotoData;
  let category;
  let categoryCountDocument;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();
    db = client.db('testDB');

    PhotoInfo.injectDB(db);
    CategoryCount.injectDB(db);
    User.injectDB(db);

    newUser = await User.create(
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
      faker.person.firstName(),
      faker.person.lastName(),
      faker.location.zipCode('#####'),
    );

    category = getRandomCategory();
  });

  after(async () => {
    await User.delete(newUser._id);
    await closeDB();
    await client.close();
    await mongoServer.stop();
  });

  before(() => {});
  describe('insertOne', () => {
    it('should insert photo info document successfully', async () => {
      newPhotoData = await PhotoInfo.insertOne(category, {
        _id: newUser._id,
        username: newUser.userName,
      });
      expect(newPhotoData).to.not.be.null;
      expect();
    });

    it('should return the same category that was inserted', () => {
      expect(newPhotoData.category).to.equal(category);
    });

    it("should have a categoryUpload value that is equal to the CategoryCount document's value", async () => {
      categoryCountDocument = await CategoryCount.findByUserId(newUser._id);
      expect(categoryCountDocument.pictureData[category]).to.equal(
        newPhotoData.categoryUploads,
      );
    });

    it("should have a totalUploads value that is equal to the CategoryCount document's value", () => {
      expect(categoryCountDocument.totalUploads).to.equal(
        newPhotoData.totalUploads,
      );
    });

    it('should throw an error if an invalid userId is entered', async () => {
      try {
        await PhotoInfo.insertOne(category, {
          _id: 22,
          username: 'error',
        });
        expect.fail('Expected an error but none was thrown');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.include("Unable to locate user's category");
      }
    });
  });

  describe('getAllUsersPhotoInfo', () => {
    let photoArray;
    before(async () => {
      photoArray = await PhotoInfo.getAllUsersPhotoInfo(newUser._id);
    });

    it('should return an array', async () => {
      expect(photoArray).to.be.an('array');
      const emptyPhotoArray = await PhotoInfo.getAllUsersPhotoInfo(22);
      expect(emptyPhotoArray).to.be.an('array');
    });

    it('should return the correct length', () => {
      expect(photoArray.length).to.equal(1);
    });

    it('should be contain the correct object', () => {
      expect(photoArray[0]).to.have.property(
        '_id' && 'userId' && 'category' && 'createdAt',
      );
    });

    it('should throw errors with a statusCode property of 500', async () => {
      try {
        await PhotoInfo.getAllUsersPhotoInfo('id');
        expect.fail('Expected method to throw an error');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.statusCode).to.be.equal(500);
      }
    });
  });
});
