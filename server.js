const express = require("express");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoClient = require("mongodb").MongoClient;
const LocalStrategy = require("passport-local").Strategy;
const app = express();
const passport = require("passport");

let db;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(
  session({ secret: "비밀코드", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

require("dotenv").config();

MongoClient.connect(process.env.DB_URL, (error, client) => {
  if (error) {
    return console.log(error);
  }

  db = client.db("nodeapp");

  app.listen(process.env.PORT, () => {
    console.log("listening on 8080");
  });
});

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

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/mypage", isLogin, (req, res) => {
  res.render("mypage.ejs");
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

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/fail" }),
  (req, res) => {
    res.redirect("/");
  }
);

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

// Passport
//
passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    (입력한아이디, 입력한비번, done) => {
      console.log(입력한아이디, 입력한비번);

      db.collection("login").findOne({ id: 입력한아이디 }, (error, result) => {
        if (error) return done(error);

        if (!result)
          return done(null, false, { message: "존재하지않는 아이디요" });

        if (입력한비번 == result.pw) {
          return done(null, result);
        } else {
          return done(null, false, { message: "비번틀렸어요" });
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((아이디, done) => {
  db.collection("login").findOne({ id: 아이디 }, (error, result) => {
    done(null, result);
  });
});

// Middleware
//
function isLogin(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("로그인안하셨는데요?");
  }
}
