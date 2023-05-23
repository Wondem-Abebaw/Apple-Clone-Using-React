const mysql = require("mysql");
const express = require("express");
var cors = require("cors");
const bodyparser = require("body-parser");
var app = express();
app.use(cors());
// Use  body parser as middle ware
app.use(bodyparser.urlencoded({ extended: true }));

var mysqlConnection = mysql.createConnection({
  user: "mydbuser",
  password: "mydbuser",
  host: "127.0.0.1",
  database: "mydb",
});

mysqlConnection.connect((err) => {
  if (err) console.log(err);
  else console.log("Connected");
});

//Install: Create the tables necessary
app.get("/install", (req, res) => {
  let message = "Tables Created";
  let createProducts = `CREATE TABLE if not exists Products(
      product_id int auto_increment,
      product_url varchar(255) not null,
      product_name varchar(255) not null,
      PRIMARY KEY (product_id))`;
  let createProductDescription = `CREATE TABLE if not exists ProductDescription(
    description_id int auto_increment,
    product_id int(11) not null,
    product_brief_description TEXT not null,
    product_description TEXT not null,
    product_img varchar(255) not null,
    product_link varchar(255) not null,
    PRIMARY KEY (description_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
  )`;
  let createProductPrice = `CREATE TABLE if not exists ProductPrice(
    price_id int auto_increment,
    product_id int(11) not null,    
    starting_price varchar(255) not null,
    price_range varchar(255) not null,
    PRIMARY KEY (price_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
  )`;
  let createUser = `CREATE TABLE if not exists user(
    user_id int auto_increment,
    user_name varchar(25) not null,
    user_password varchar(25) not null,
    PRIMARY KEY (user_id)
  )`;
  let createOrders = `CREATE TABLE if not exists orders(
    order_id int auto_increment,
    product_id int(11) not null,
    user_id int(11) not null,
    PRIMARY KEY(order_id),
    FOREIGN KEY(product_id) REFERENCES products(product_id),
    FOREIGN KEY(user_id) REFERENCES user( user_id)
  )`;

  mysqlConnection.query(createProducts, (err, results, fields) => {
    if (err) console.log(err);
  });
  mysqlConnection.query(createProductDescription, (err, results, fields) => {
    if (err) console.log(err);
  });
  mysqlConnection.query(createProductPrice, (err, results, fields) => {
    if (err) console.log(err);
  });
  mysqlConnection.query(createUser, (err, results, fields) => {
    if (err) console.log(err);
  });
  mysqlConnection.query(createOrders, (err, results, fields) => {
    if (err) console.log(err);
  });

  res.end(message);
});
app.post("/add_products", (req, res) => {
  // console.log(bodyparser.json);
  console.log(req.body);
  let Id = req.body.iphoneId;
  let Title = req.body.iphoneTitle;

  let img = req.body.imgPath;
  let Url = req.body.iphoneLink;
  let Brief = req.body.briefDescription;
  let Description = req.body.fullDescription;

  let StartPrice = req.body.StartPrice;
  let PriceRange = req.body.priceRange;

  let userName = req.body.userName;
  let userPassword = req.body.userPassword;

  // To use it as a foreign key
  let addedProductId = 0;
  let addedUserId = 0;

  let sqlAddToProducts =
    "INSERT INTO Products (product_url, product_name) VALUES ('" +
    Id +
    "', '" +
    Title +
    "' )";

  mysqlConnection.query(sqlAddToProducts, function (err, result) {
    if (err) throw err;
    console.log("product  inserted");
  });

  mysqlConnection.query(
    "SELECT * FROM Products WHERE product_url = '" + Id + "' ",
    (err, rows, fields) => {
      addedProductId = rows[0].product_id;
      console.log(addedProductId);
      if (err) console.log(err);

      if (addedProductId != 0) {
        let sqlAddToProductDescription =
          "INSERT INTO ProductDescription (product_id, product_brief_description, product_description, product_img, product_link) VALUES ('" +
          addedProductId +
          "', '" +
          Brief +
          "', '" +
          Description +
          "', '" +
          img +
          "', '" +
          Url +
          "' )";

        let sqlAddToProductPrice =
          "INSERT INTO ProductPrice (product_id, starting_price, price_range) VALUES ('" +
          addedProductId +
          "', '" +
          StartPrice +
          "', '" +
          PriceRange +
          "')";

        mysqlConnection.query(
          sqlAddToProductDescription,
          function (err, result) {
            if (err) throw err;
            console.log("Product description inserted");
          }
        );

        mysqlConnection.query(sqlAddToProductPrice, function (err, result) {
          if (err) throw err;
          console.log("Product price inserted");
        });
        mysqlConnection.query(
          "SELECT * FROM user WHERE user_name = '" + userName + "' ",
          (err, rows, fields) => {
            addedUserId = rows[0].user_name;
            console.log(addedUserId);
            if (err) console.log(err);

            if (addedUserId != 0) {
              let sqlAddToOrders =
                "INSERT INTO orders(order_id,product_id,user_id) VALUES('" +
                addedProductId +
                "','" +
                addedUserId +
                "')";
            }
          }
        );
      }
    }
  );

  let sqlAddToUser =
    "INSERT INTO user(user_name,user_password) VALUES('" +
    userName +
    "','" +
    userPassword +
    "')";
  mysqlConnection.query(sqlAddToUser, function (err, result) {
    if (err) throw err;
    console.log("user  inserted");
  });
  res.end("Product added");
});

//Get all iphones
app.get("/iphones", (req, res) => {
  mysqlConnection.query(
    "SELECT * FROM Products JOIN ProductDescription JOIN ProductPrice ON Products.product_id = ProductDescription.product_id AND Products.product_id = ProductPrice.product_id",
    (err, rows, fields) => {
      let iphones = { products: [] };
      iphones.products = rows;
      var stringIphones = JSON.stringify(iphones);
      if (!err) res.end(stringIphones);
      else console.log(err);
    }
  );
});

app.listen(3003, () => console.log("Listening to : 3003"));
