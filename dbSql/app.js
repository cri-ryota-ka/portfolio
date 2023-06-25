const express = require("express");
const app = express();
const port = 3000;
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const jsonParse = bodyParser.json();

const connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "ユーザーのパスワード",
      database: "個人のデータベース名"
});

connection.connect(function(err) {
  if (err) return console.log(err);
  return console.log("DB connect success");
});

app.use(express.static("front"));

app.get("/", function(req, res) {
    // res.sendFile("index.html", {root: "./"});
});

app.listen(port, function() {
  return console.log(`app listening port ${port}`);
});

// get
app.get("/fetch_user", function(req, res) {
  const sqlUserSelect = "select * from user;";
  connection.execute(sqlUserSelect, function(err, result) {
    if (err) return console.log(err);
    return res.send(result);
  });
})

app.get("/fetch_info", function(req, res) {
  const sqlInfoSelect = `select * from info;`;
  connection.execute(sqlInfoSelect, function(err, result) {
    if (err) return console.log(err);
    return res.send(result);
  });
});

app.get("/fetch", function(req, res) {
  const sqlUserInfoSelect = `select * from info right join user on user.id = info.user_id;`;
  connection.execute(sqlUserInfoSelect, function(err, result) {
    if (err) return console.log(err);
    return res.send(result);
  });
});

// insert
app.post("/fetch_user", jsonParse, function(req, res) {
  const sqlUserInsert = `insert into user(name) values("${req.body.name}");`;
  connection.execute(sqlUserInsert, function(err, result) {
    if (err) return console.log(err);
    return res.send(result);
  });
});

app.post("/fetch_info", jsonParse, function(req, res) {
  const sqlInfoInsert = `insert into info(user_id, info) values(${req.body.user_id}, "${req.body.info}")`;
  connection.execute(sqlInfoInsert, function(err, result) {
    if (err) return console.log(err);
    return res.send(result);
  });
});

// update
app.put("/fetch_user", jsonParse, function(req, res) {
  const sqlUserUpdate = `update user set name = "${req.body.name}" where id = ${req.body.id};`
  connection.execute(sqlUserUpdate, function(err, result) {
    if (err) return console.log(err);
    return res.send(result);
  });
});

// delete
app.delete("/fetch_info", jsonParse, function(req, res) {
  const sqlInfoDelete = `delete from info where id = ${req.body.id}`;
  connection.execute(sqlInfoDelete, function(err, result) {
    if (err) return console.log(err);
    return res.send(result);
  });
});
