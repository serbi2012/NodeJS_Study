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
  db.collection("counter").findOne({ name: "postNum" }, (error, result) => {
    let postId = result.totalPost;

    console.log(`현재 총 게시물은 ${result.totalPost}개`);

    db.collection("counter").updateOne(
      { name: "postNum" },
      { $inc: { totalPost: 1 } },
      (error, result) => {
        console.log("postNum업데이트 완료.");

        db.collection("post").insertOne(
          { _id: postId, ...req.body },
          (error, result) => {
            console.log("post에 데이터 저장 완료.");

            db.collection("post")
              .find()
              .toArray((error, result) => {
                console.log(result);
                res.render("list.ejs", { posts: result });
              });
          }
        );
      }
    );
  });
});

app.delete("/delete", (req, res) => {
  req.body._id = parseInt(req.body._id);

  db.collection("post").deleteOne(req.body, (error, result) => {
    console.log(`${req.body._id}번 id 삭제 완료`);
  });
});

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/style.css");
});
