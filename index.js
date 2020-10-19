const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
const app = express();
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m0vup.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());
const port = 5000;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.send('<h1>i am workinkig</h1>')
})

client.connect(err => {
    const collection = client.db("test").collection("devices");
    const customersCollection = client.db("creativeAgency").collection("customers");
    const servicesCollection = client.db("creativeAgency").collection("services");
    const reviewsCollection = client.db("creativeAgency").collection("reviews");
    const adminCollection = client.db("creativeAgency").collection("admin");

    console.log("data base conected");

      app.post('/addService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        servicesCollection.insertOne({ title, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
            .catch(err => {
                console.log(err);
            })
    })
    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
    app.get('/service/:serviceId', (req, res) => {
        servicesCollection.find({ _id: ObjectId(req.params.serviceId) })
            .toArray((err, document) => {
                res.status(200).send(document[0]);
            })
    })
    app.post('/addCustomer', (req, res) => {
        const customer = req.body;
        customersCollection.insertOne(customer)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/customer', (req, res) => {
        customersCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.status(200).send(documents);
            })
    })
    app.get('/allData', (req, res) => {
        customersCollection.find({})
            .toArray((err, documents) => {
                res.status(200).send(documents);
            })
    })
    app.post('/review', (req, res) => {
        const review = req.body;
        reviewsCollection.insertOne(review)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/allReviews', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
    app.post('/addAdmin', (req, res) => {
        const admin = req.body;
        adminCollection.insertOne(admin)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/isAdmin', (req, res) => {
        adminCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.status(200).send(documents);
            })
    })
    app.patch('/updateStatus', (req, res) => {
        customersCollection.updateOne(
            { _id: ObjectId(req.body.id) },
            {
                $set: { status: req.body.updatedStatus },
                $currentDate: { "lastModified": true }
            }
        )
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })
    
  });



app.listen(process.env.PORT || port);