const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());

var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.5icft.mongodb.net:27017,cluster0-shard-00-01.5icft.mongodb.net:27017,cluster0-shard-00-02.5icft.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-gpihsg-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    console.log("database connected");

    const database = client.db("ornaments");
    const glassCollection = database.collection("products");
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("allOrder");
    const reviewsCollection = database.collection("reviews");

    app.get("/products", async (req, res) => {
      const cursor = glassCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    //add products
    app.post("/products", async (req, res) => {
      const cursor = req.body;
      const result = await glassCollection.insertOne(cursor);
      console.log(result);
      res.json(result);
    });
    //save user
    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // order api
    app.post("/allOrder", async (req, res) => {
      const orders = req.body;
      // console.log(orders);
      const result = await ordersCollection.insertOne(orders);
      res.json(result);
    });

    //all order
    app.get("/allOrder", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    //my order api
    app.get("/allOrder/:email", async (req, res) => {
      const email = req.params.email;
      const result = await ordersCollection.find({ email }).toArray();
      res.json(result);
    });
    //delete order api
    app.delete("/allOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });
    //delete manage-order delete api
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await glassCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    //shipping api
    app.put("/allOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const package = {
        $set: {
          status: "Shipped",
        },
      };
      const result = await ordersCollection.updateOne(query, package);
      console.log(result);
      res.json(result);
    });

    //role admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      // console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      console.log(result);
      res.send(result);
    });

    // make admin for client site
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //add review
    app.post("/reviews", async (req, res) => {
      const cursor = req.body;
      // console.log(cursor);
      const review = await reviewsCollection.insertOne(cursor);
      console.log(review);
      res.send(review);
    });

    //get review
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const review = await cursor.toArray();
      res.json(review);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello form oculus");
});

app.listen(port, () => {
  console.log("port is running on", port);
});
