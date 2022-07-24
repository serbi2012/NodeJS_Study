const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;

let db;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

MongoClient.connect(
  "mongodb+srv://serbi2012:fb6fr2486R@cluster0.5dzsw.mongodb.net/nodeapp?retryWrites=true&w=majority",
  (error, client) => {
    if (error) {
      return console.log(error);
    }

    db = client.db("nodeapp");

    app.listen("8080", () => {
      console.log("listening on 8080");
    });
  }
);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/write", (req, res) => {
  res.sendFile(__dirname + "/write.html");
});

app.get("/list", (req, res) => {
  db.collection("post")
    .find()
    .toArray((error, result) => {
      console.log(result);
      res.render("list.ejs", { posts: result });
    });
});

app.post("/add", (req, res) => {
  res.send("전송완료");
  db.collection("post").insertOne({ ...req.body }, (error, result) => {
    console.log("저장완료");
  });
});

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/style.css");
});
