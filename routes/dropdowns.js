var express = require("express");
const router = express.Router();
var dbConn = require("../lib/db");

// display books page
// router.get('/countries', function(req, res, next) {
//     console.log("in countries dropdown request");
//     dbConn.query('SELECT * from country',function(err,rows)     {
//         if(err) {
//             req.flash('error', err);
//             // // render to views/books/index.ejs
//             // res.render('books',{data:''});
//         } else {
//             // render to views/books/index.ejs
//             console.log(rows);
//             // res.render('books',{data:rows});
//         }
//     });
// });

// display add book page
router.get("/add", function (req, res, next) {
  // render to add.ejs
  res.render("books/add", {
    name: "",
    author: ""
  });
});

// add a new book
router.post("/add", function (req, res, next) {
  let name = req.body.name;
  let author = req.body.author;
  let errors = false;

  if (name.length === 0 || author.length === 0) {
    errors = true;

    // set flash message
    req.flash("error", "Please enter name and author");
    // render to add.ejs with flash message
    res.render("books/add", {
      name: name,
      author: author
    });
  }

  // if no error
  if (!errors) {
    var form_data = {
      name: name,
      author: author
    };

    // insert query
    dbConn.query("INSERT INTO books SET ?", form_data, function (err, result) {
      //if(err) throw err
      if (err) {
        req.flash("error", err);

        // render to add.ejs
        res.render("books/add", {
          name: form_data.name,
          author: form_data.author
        });
      } else {
        req.flash("success", "Book successfully added");
        res.redirect("/books");
      }
    });
  }
});

// display edit book page
router.get("/edit/(:id)", function (req, res, next) {
  let id = req.params.id;

  dbConn.query("SELECT * FROM books WHERE id = " + id, function (err, rows, fields) {
    if (err) throw err;

    // if user not found
    if (rows.length <= 0) {
      req.flash("error", "Book not found with id = " + id);
      res.redirect("/books");
    }
    // if book found
    else {
      // render to edit.ejs
      res.render("books/edit", {
        title: "Edit Book",
        id: rows[0].id,
        name: rows[0].name,
        author: rows[0].author
      });
    }
  });
});

// update book data
router.post("/update/:id", function (req, res, next) {
  let id = req.params.id;
  let name = req.body.name;
  let author = req.body.author;
  let errors = false;

  if (name.length === 0 || author.length === 0) {
    errors = true;

    // set flash message
    req.flash("error", "Please enter name and author");
    // render to add.ejs with flash message
    res.render("books/edit", {
      id: req.params.id,
      name: name,
      author: author
    });
  }

  // if no error
  if (!errors) {
    var form_data = {
      name: name,
      author: author
    };
    // update query
    dbConn.query("UPDATE books SET ? WHERE id = " + id, form_data, function (err, result) {
      //if(err) throw err
      if (err) {
        // set flash message
        req.flash("error", err);
        // render to edit.ejs
        res.render("books/edit", {
          id: req.params.id,
          name: form_data.name,
          author: form_data.author
        });
      } else {
        req.flash("success", "Book successfully updated");
        res.redirect("/books");
      }
    });
  }
});

module.exports = {
  routes: router
};
