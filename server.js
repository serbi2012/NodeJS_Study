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
  db.collection("post")
    .find()
    .toArray((error, result) => {
      console.log(result);
      res.render("list.ejs", { posts: result });
    });
});

app.post("/add", (req, res) => {
  res.send("전송완료");

  db.collection("counter").findOne({ name: "postNum" }, (error, result) => {
    let postId = result.totalPost;

    console.log(result.totalPost);

    db.collection("counter").updateOne(
      { name: "postNum" },
      { $inc: { totalPost: 1 } },
      (error, result) => {
        console.log("수정완료");

        db.collection("post").insertOne(
          { _id: postId, ...req.body },
          (error, result) => {
            console.log("저장완료");
          }
        );
      }
    );
  });
});

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/style.css");
});
