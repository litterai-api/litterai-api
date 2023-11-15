/* eslint-disable no-unused-expressions */
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';
import chai from 'chai';
import User from '../../models/User.js';
import PhotoInfo from '../../models/PhotoInfo.js';
import CategoryCount from '../../models/CategoryCount.js';

const { expect } = chai;
let mongoServer;
let client;
let db;
let newUser;

let userDeleteTest;

const convertIdToString = (user) => ({
  ...user,
  _id: user._id.toHexString(),
});

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  client = new MongoClient(uri);
  await client.connect();
  db = client.db('testDB');

  PhotoInfo.injectDB(db);
  CategoryCount.injectDB(db);
  User.injectDB(db);

  const newUserPassword = faker.internet.password();
  newUser = await User.create(
    faker.internet.userName(),
    faker.internet.email(),
    newUserPassword,
    faker.person.firstName(),
    faker.person.lastName(),
    faker.location.zipCode('#####'),
  );

  newUser = { ...newUser, password: newUserPassword };
});

after(async () => {
  User.delete(newUser._id);
  await client.close();
  await mongoServer.stop();
});

describe('User Model', () => {
  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = await User.findByEmail(newUser.email);
      expect(user).to.not.be.null;
      expect(convertIdToString(user)).to.deep.equal(newUser);
    });

    it('should return null for a non-existing email', async () => {
      const user = await User.findByEmail('nonexistent@example.com');
      expect(user).to.be.null;
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const user = await User.findById(newUser._id);
      expect(user).to.not.be.null;
      expect(convertIdToString(user)).to.deep.equal(newUser);
    });

    it('should return null for a non-existing id', async () => {
      const user = await User.findById(22);
      expect(user).to.be.null;
    });
  });

  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      const user = await User.findByUsername(newUser.username);
      expect(user).to.not.be.null;
      expect(convertIdToString(user)).to.deep.equal(newUser);
    });
    it('should find a user by username when username needs to be trimmed or has capital letters', async () => {
      const user = await User.findByUsername(
        ` ${newUser.username.toUpperCase()}  `,
      );
      expect(user).to.not.be.null;
      expect(convertIdToString(user)).to.deep.equal(newUser);
    });
    it('should return null for non-existing username', async () => {
      const user = await User.findByUsername('fake');
      expect(user).to.be.null;
    });
  });
  describe('create', () => {
    let createdUser;
    after(async () => {
      await User.delete(createdUser._id);
    });
    it('should create a new user', async () => {
      createdUser = await User.create(
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
        faker.person.firstName(),
        faker.person.lastName(),
        faker.location.zipCode('#####'),
      );
      expect(createdUser).to.not.be.null;
      expect(createdUser).to.not.have.property('password');
      expect(createdUser).to.have.property(
        '_id' &&
          'username' &&
          'displayUsername' &&
          'email' &&
          'firstName' &&
          'lastName' &&
          'zipCode',
      );
    });
  });
  describe('delete', () => {
    before(async () => {
      userDeleteTest = await User.create(
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
        faker.person.firstName(),
        faker.person.lastName(),
        faker.location.zipCode('#####'),
      );

      await Promise.all([
        PhotoInfo.insertOne('trash', {
          _id: userDeleteTest._id,
          username: userDeleteTest.username,
        }),
        PhotoInfo.insertOne('plastic', {
          _id: userDeleteTest._id,
          username: userDeleteTest.username,
        }),
      ]);
    });
    it("should delete the selected user's data from all collections", async () => {
      const user = await User.findById(userDeleteTest._id);
      let userPhotos = await PhotoInfo.getAllUsersPhotoInfo(userDeleteTest._id);
      expect(user.email).to.equal(userDeleteTest.email);
      expect(userPhotos.length).to.equal(2);
      const deleteResult = await User.delete(user._id);

      userPhotos = await PhotoInfo.getAllUsersPhotoInfo(userDeleteTest._id);
      const userCategoryCountDocument = await CategoryCount.findByUserId(
        userDeleteTest._id,
      );
      expect(deleteResult).to.be.true;
      expect(userPhotos.length).to.equal(0);
      expect(userCategoryCountDocument).to.be.null;
    });
    it('should return false if there is no matching user', async () => {
      const user = await User.delete(userDeleteTest._id);
      expect(user).to.be.false;
    });
  });
});
