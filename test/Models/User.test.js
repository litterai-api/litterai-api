import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';
import User from '../../models/User.js';
import PhotoInfo from '../../models/PhotoInfo.js';
import CategoryCount from '../../models/CategoryCount.js';
import { closeDB } from '../../DB/db-connection.js';

const convertIdToString = (user) => ({
    ...user,
    _id: user._id.toHexString(),
});

describe('User Model', () => {
    let mongoServer;
    let client;
    let db;
    let newUser;

    let userDeleteTest;
    beforeAll(async () => {
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

    afterAll(async () => {
        await User.delete(newUser._id);
        await closeDB();
        await client.close();
        await mongoServer.stop();
    });

    describe('findByEmail', () => {
        test('should find a user by email', async () => {
            const user = await User.findByEmail(newUser.email);
            expect(user).not.toBeNull();
            expect(convertIdToString(user)).toEqual(newUser);
        });

        test('should return null for a non-existing email', async () => {
            const user = await User.findByEmail('nonexistent@example.com');
            expect(user).toBeNull();
        });
    });

    describe('findById', () => {
        test('should find a user by id', async () => {
            const user = await User.findById(newUser._id);
            expect(user).not.toBeNull();
            expect(convertIdToString(user)).toEqual(newUser);
        });

        test('should return null for a non-existing id', async () => {
            const user = await User.findById(22);
            expect(user).toBeNull();
        });
    });

    describe('findByUsername', () => {
        test('should find a user by username', async () => {
            const user = await User.findByUsername(newUser.username);
            expect(user).not.toBeNull();
            expect(convertIdToString(user)).toEqual(newUser);
        });

        test('should find a user by username when username needs to be trimmed or has capital letters', async () => {
            const user = await User.findByUsername(
                ` ${newUser.username.toUpperCase()}  `,
            );
            expect(user).not.toBeNull();
            expect(convertIdToString(user)).toEqual(newUser);
        });

        test('should return null for non-existing username', async () => {
            const user = await User.findByUsername('fake');
            expect(user).toBeNull();
        });
    });

    describe('create', () => {
        let createdUser;
        afterAll(async () => {
            await User.delete(createdUser._id);
        });

        test('should create a new user', async () => {
            createdUser = await User.create(
                faker.internet.userName(),
                faker.internet.email(),
                faker.internet.password(),
                faker.person.firstName(),
                faker.person.lastName(),
                faker.location.zipCode('#####'),
            );
            expect(createdUser).not.toBeNull();
            expect(createdUser).not.toHaveProperty('password');
            expect(createdUser).toHaveProperty('_id');
            expect(createdUser).toHaveProperty('username');
            expect(createdUser).toHaveProperty('displayUsername');
            expect(createdUser).toHaveProperty('email');
            expect(createdUser).toHaveProperty('firstName');
            expect(createdUser).toHaveProperty('lastName');
            expect(createdUser).toHaveProperty('zipCode');
        });
    });

    describe('delete', () => {
        beforeAll(async () => {
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

        test("should delete the selected user's data from all collections", async () => {
            const user = await User.findById(userDeleteTest._id);
            let userPhotos = await PhotoInfo.getAllUsersPhotoInfo(
                userDeleteTest._id,
            );
            expect(user.email).toEqual(userDeleteTest.email);
            expect(userPhotos.length).toEqual(2);
            const deleteResult = await User.delete(user._id);

            userPhotos = await PhotoInfo.getAllUsersPhotoInfo(
                userDeleteTest._id,
            );
            const userCategoryCountDocument = await CategoryCount.findByUserId(
                userDeleteTest._id,
            );
            expect(deleteResult).toBeTruthy();
            expect(userPhotos.length).toEqual(0);
            expect(userCategoryCountDocument).toBeNull();
        });

        test('should return false if there is no matching user', async () => {
            const result = await User.delete(userDeleteTest._id);
            expect(result).toBeFalsy();
        });
    });
});
