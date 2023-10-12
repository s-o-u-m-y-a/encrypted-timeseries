const dbName = 'test';
const colName = "data";
const uri = `mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000`;

import { default as mongodb } from 'mongodb';
let MongoClient = mongodb.MongoClient;

export function writetoDB(query) {

    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        if (err) {
            return err;
        }

        //client.db(dbName).createCollection("data", { timeseries: { timeField: "timestamp" } } )

        const col = client.db(dbName).collection(colName)

        console.log('query', query);

        col.insertMany(query, (err, result) => {
            if (err) {
                return err;
            }
            client.close();
        });
    });
}