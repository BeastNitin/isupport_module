const e = require("connect-flash");
var express = require("express");
const router = express.Router();
var dbConn = require("../lib/db");
const { payloadChecker } = require("../lib/helpers");

router.use(payloadChecker);

/**
 * DO NOT USE THESE ENDPOINTS
 * They will get removed from here and will get merged with /facility endpoints
 */

router.post("/add", function (req, res) {
  dbConn.query(
    "INSERT INTO facilityshippingaddress (FACILITYID, SHIPTOCONTACT, FACILITYNAME, ADDRESS, CITY, SPAINSTATE, STATEORPROVINCE, COUNTRY, ZIPCODE, PHONE, FAX, EMAILADDRESS, CREATEDBY) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      req.session.lastAddedFacilityId,
      req.body.shipping_contact_name,
      req.body.shipping_facility_name,
      req.body.shipping_address,
      req.body.shipping_city,
      req.body.shipping_state,
      req.body.shipping_STATEORPROVINCE,
      req.body.shipping_country,
      req.body.shipping_zipcode,
      req.body.shipping_phoneno,
      req.body.shipping_fax,
      req.body.shipping_email,
      "Mubasher"
    ],
    function (err, result) {
      if (err) {
        console.log("Error in adding shipping information.");
        console.log(err);
        res.status(500).send();
      } else {
        console.log("Shipping Information Saved Successfully");
        res.status(204).send();
      }
    }
  );
});

router.post("/update/:id", function (req, res, next) {
  let errors = false;
  // if(name.length === 0 || author.length === 0) {
  //     errors = true;
  //     // set flash message
  //     req.flash('error', "Please enter name and author");
  //     // render to add.ejs with flash message
  //     res.render('books/edit', {
  //         id: req.params.id,
  //         name: name,
  //         author: author
  //     })
  // }
  // // if no error
  // if( !errors ) {
  //     var form_data = {
  //         name: name,
  //         author: author
  //     }

  dbConn.query(
    "UPDATE facilityshippingaddress SET ? WHERE id = " + req.params.id,
    req.body,
    function (err, result) {
      if (err) {
        console.log("Error in updating facility shipping address");
        console.log(err);
        // set flash message
        // req.flash('error', err)
        // // render to edit.ejs
        // res.render('books/edit', {
        //     id: req.params.id,
        //     name: form_data.name,
        //     author: form_data.author
        // })
      } else {
        console.log("Facility shipping address updated successfully");
        res.status(204).send();
      }
    }
  );
  // }
});

module.exports = {
  routes: router
};
