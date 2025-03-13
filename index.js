const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


//mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xu3a3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("bambo_brush").collection("products");
    const usersDatabase = client.db("bambo_brush").collection("users");

    //get product
    app.get("/product", async (req, res) => {
      const cursor = database.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //get product
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await database.findOne(query);
      res.send(result);
    });

    //post product
    app.post("/product", async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await database.insertOne(newProduct);
      res.send(result);
    });

    //update product
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          image: data.image,
          title: data.title,
          price: data.price,
          description: data.description,
        },
      };
      const result = await database.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    //delete product
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await database.deleteOne(query);
      res.send(result);
    });

    //Users Api create
    app.get("/users", async (req, res) => {
      const cursor = usersDatabase.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post('/users', async(req, res)=>{
      const usersInfo = req.body
      console.log(usersInfo);
      const result = await usersDatabase.insertOne(usersInfo);
      res.send(result)
    })

    //update User
    app.patch("/users/", async (req, res) => {
      const email = req.body.email;
      const filter = { email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          lastSignInTime : req.body.lastSignInTime
        },
      };
      const result = await usersDatabase.updateOne(filter, updateDoc, options);
      res.send(result);
    });

     //Delete user
     app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersDatabase.deleteOne(query);
      res.send(result);
    });
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("User Management Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on PORT : ${port}`);
});

// Export the Express API
module.exports = app;