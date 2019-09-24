var mongo = require("mongodb").MongoClient;

var url = "mongodb://localhost:27017";

function drop() {
    let conn;
    mongo.connect(url)
            .then((client) => {
              conn = client;
              return client.db("test");
            })
            .then((db) => db.dropCollection("Login"));
}

function init() {
    drop();
    let conn;
    mongo.connect(url)
            .then((client) => {
              conn = client;
              return client.db("test");
            })
            .then((db) => db.createCollection("Login"))
            .then((collection) => collection.insertMany([
                    {username: "tom", password: "cat"},
                    {username: "harry", password: "potter"},
                    {username: "niraj", password: "deep-dive@369"}
                ]))
            .then(() => conn.close())
            .then(() => test());
}

function test() {
    let conn;
    mongo.connect(url)
            .then((client) => {
              conn = client;
              return client.db("test");
            })
            .then((db) => db.collection("Login"))
            .then((collection) => collection.find())
            .then((data) => data.forEach(doc => console.log(doc)))
            .then(() => conn.close());
}

init();