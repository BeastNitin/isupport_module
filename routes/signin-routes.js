const express = require("express");
const { post } = require("request");
const request = require("request");

const { lockView } = require("../controllers/signinController");

const router = express.Router();

var dropDown = [];

router.get("/lock/illustration", lockView);

router.post("/user_login", function (req, res) {
  //   request(
  //     {
  //       url: "http://3.133.20.223:8080/user_login/",
  //       method: "POST",
  //       headers: {},
  //       json: {
  //         username: req.body.username,
  //         password: req.body.password,
  //         organization: "iComply Lifescience solutions",
  //         role: "Admin",
  //         application: "iSupport",
  //         module: "program management module"
  //       }
  //     },
  //     (err, apiRes, body) => {
  //       if (!apiRes.body.error) {
  //         console.log(
  //           "\n\n*********************************Login successful*********************************\n\n"
  //         );
  //         req.session.accessToken = apiRes.body.access;
  res.redirect("/lock/illustration");
  //       } else {
  //         console.log(apiRes.body.error);
  //         res.redirect("/signin/illustration");
  //       }
  //     }
  //   );
});

module.exports = {
  routes: router
};
