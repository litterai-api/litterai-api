import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';
import PhotoInfo from '../../models/PhotoInfo.js';
import CategoryCount from '../../models/CategoryCount.js';
import User from '../../models/User.js';
import { closeDB } from '../../DB/db-connection.js';

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

    beforeAll(async () => {
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

    afterAll(async () => {
        await User.delete(newUser._id);
        await closeDB();
        await client.close();
        await mongoServer.stop();
    });

    describe('insertOne', () => {
        test('should insert photo info document successfully', async () => {
            newPhotoData = await PhotoInfo.insertOne(category, {
                _id: newUser._id,
                username: newUser.userName,
            });
            expect(newPhotoData).not.toBeNull();
        });

        test('should return the same category that was inserted', () => {
            expect(newPhotoData.category).toEqual(category);
        });

        test("should have a categoryUpload value that is equal to the CategoryCount document's value", async () => {
            categoryCountDocument = await CategoryCount.findByUserId(
                newUser._id,
            );
            expect(categoryCountDocument.pictureData[category]).toEqual(
                newPhotoData.categoryUploads,
            );
        });

        test("should have a totalUploads value that is equal to the CategoryCount document's value", () => {
            expect(categoryCountDocument.totalUploads).toEqual(
                newPhotoData.totalUploads,
            );
        });

        test('should throw an error if an invalid userId is entered', async () => {
            await expect(
                PhotoInfo.insertOne(category, {
                    _id: 22,
                    username: 'error',
                }),
            ).rejects.toThrow("Unable to locate user's category");
        });
    });

    describe('getAllUsersPhotoInfo', () => {
        let photoArray;

        beforeAll(async () => {
            photoArray = await PhotoInfo.getAllUsersPhotoInfo(newUser._id);
        });

        test('should return an array', async () => {
            expect(photoArray).toBeInstanceOf(Array);
            const emptyPhotoArray = await PhotoInfo.getAllUsersPhotoInfo(22);
            expect(emptyPhotoArray).toBeInstanceOf(Array);
        });

        test('should return the correct length', () => {
            expect(photoArray.length).toEqual(1);
        });

        test('should be contain the correct object', () => {
            expect(photoArray[0]).toHaveProperty('_id');
            expect(photoArray[0]).toHaveProperty('userId');
            expect(photoArray[0]).toHaveProperty('category');
            expect(photoArray[0]).toHaveProperty('createdAt');
        });

        test('should throw errors with a statusCode property of 500', async () => {
            await expect(
                PhotoInfo.getAllUsersPhotoInfo('id'),
            ).rejects.toThrow();
            await expect(
                PhotoInfo.getAllUsersPhotoInfo('id'),
            ).rejects.toHaveProperty('statusCode', 500);
        });
    });
});
