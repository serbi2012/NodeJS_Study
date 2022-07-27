const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");

let db;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

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

// GET
//
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/write", (req, res) => {
  db.collection("post")
    .find()
    .toArray((error, result) => {
      console.log(result);
      res.render("list.ejs", { posts: result });
    });
});

app.get("/detail/:detailId", (req, res) => {
  db.collection("post").findOne(
    { _id: parseInt(req.params.detailId) },
    (error, result) => {
      console.log(result);
      res.render("detail.ejs", { posts: result });
    }
  );
});

app.get("/edit/:editId", (req, res) => {
  db.collection("post").findOne(
    { _id: parseInt(req.params.editId) },
    (error, result) => {
      console.log(result);

      res.render("edit.ejs", { data: result });
    }
  );
});

// POST
//
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

// PUT
//
app.put("/edit", function (req, res) {
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { title: req.body.title, date: req.body.date } },
    (error, result) => {
      console.log(`${req.body.id}번 게시물 수정완료.`);

      res.redirect("/write");
    }
  );
});

// DELETE
//
app.delete("/delete/:id", (req, res) => {
  db.collection("post").deleteOne(
    { _id: parseInt(req.params.id) },
    (error, result) => {
      console.log(`${req.params.id}번 id 삭제 완료`);

      db.collection("post")
        .find()
        .toArray((error, result) => {
          res.render("list.ejs", { posts: result });
        });
    }
  );
});
