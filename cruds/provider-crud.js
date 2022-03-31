const express = require("express");
const router = express.Router();
const DB = require("../lib/db");
const { payloadChecker } = require("../lib/helpers");

router.use(payloadChecker);

// insert a new heath care provider
router.post("/add", (req, res) => {
  DB.query(
    "INSERT INTO healthcareprovider( TITLEID, FIRSTNAME, MIDDLENAME, LASTNAME, ORGANIZATIONNAME, FACILITYTYPE, QUALIFICATION, ADDRESS, CITY, SPAINSTATE, STATEORPROVINCE, COUNTRY, ZIPCODE, PHONE, FAX, EMAILADDRESS, REGISTRATIONNO, ISPREFERREDPHONE, ISPREFERREDEMAIL, ISPREFERREDFAX, CREATEDBY) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      req.body.provider_title,
      req.body.provider_firstname,
      req.body.provider_middlename,
      req.body.provider_lastname,
      req.body.provider_organizationname,
      req.body.provider_facilitytype,
      req.body.provider_qualification,
      req.body.provider_address,
      req.body.provider_city,
      req.body.provider_state,
      req.body.provider_STATEORPROVINCE,
      req.body.provider_country,
      req.body.provider_zipcode,
      req.body.provider_phone,
      req.body.provider_fax,
      req.body.provider_email,
      req.body.provider_regNo,
      req.body.prefered_phone,
      req.body.prefered_email,
      req.body.prefered_fax,
      "Mubasher"
    ],
    function (err, result, fields) {
      if (err) {
        console.log("Error in saving provider.");
        console.log(err);
        res.status(500).send();
      } else {
        console.log("Provider Saved Successfully");
        res.status(204).send();
      }
    }
  );
});

// get data of a health care provider for edit form (used to populate form fields)
router.get("/edit/:id", async (req, res) => {
  if (req.session.facilityTypes == undefined || req.session.facilityTypes.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT * from facilitytype", function (err, rows) {
        req.session.facilityTypes = err ? [] : rows;
        if (err) console.error(err);
        resolve();
      });
    });
  }

  if (req.session.titles == undefined || req.session.titles.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT * from title", function (err, rows) {
        req.session.titles = err ? [] : rows;
        if (err) console.error(err);
        resolve();
      });
    });
  }

  if (req.session.qualifications == undefined || req.session.qualifications.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT * from qualification", function (err, rows) {
        req.session.qualifications = err ? [] : rows;
        if (err) console.error(err);
        resolve();
      });
    });
  }

  if (req.session.countries == undefined || req.session.countries.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT * from country", function (err, rows) {
        req.session.countries = err ? [] : rows;
        if (err) console.error(err);
        resolve();
      });
    });
  }

  if (req.session.spainStates == undefined || req.session.spainStates.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT * from spainstate", function (err, rows) {
        req.session.spainStates = err ? [] : rows;
        if (err) console.error(err);
        resolve();
      });
    });
  }

  DB.query(
    `SELECT
      H.ID, H.TITLEID, T.TITLE, H.FIRSTNAME, H.MIDDLENAME, H.LASTNAME, H.ORGANIZATIONNAME, H.FACILITYTYPE AS FACILITYTYPEID, FT.FACILITYTYPE, H.QUALIFICATION AS QUALIFICATIONID, Q.VALUE AS QUALIFICATION, H.ADDRESS, H.CITY, H.SPAINSTATE AS SPAINSTATEID, SS.SPAINSTATE, H.STATEORPROVINCE, H.COUNTRY AS COUNTRYID, C.NAME AS COUNTRY, H.ZIPCODE, H.PHONE, H.FAX, H.EMAILADDRESS, H.REGISTRATIONNO, H.ISACTIVE, H.ISPREFERREDPHONE, H.ISPREFERREDEMAIL, H.ISPREFERREDFAX
    FROM 
      healthcareprovider H
      INNER JOIN facilitytype FT ON H.FACILITYTYPE = FT.ID
      INNER JOIN qualification Q ON H.QUALIFICATION = Q.ID
      INNER JOIN spainstate SS ON H.SPAINSTATE = SS.ID
      INNER JOIN country C ON H.COUNTRY = C.ID
      INNER JOIN title T ON H.TITLEID = T.ID
    WHERE H.ID = ?`,
    [req.params.id],
    (err, rows) => {
      if (err || rows.length !== 1) {
        console.error(err, rows);
        res.status(500).send();
      } else {
        const provider = rows[0];
        if (provider.ISPREFERREDPHONE == "on") {
          provider.ISPREFERREDPHONE = "checked";
        }
        if (provider.ISPREFERREDFAX == "on") {
          provider.ISPREFERREDFAX = "checked";
        }
        if (provider.ISPREFERREDEMAIL == "on") {
          provider.ISPREFERREDEMAIL = "checked";
        }
        res.send({
          titles: req.session.titles,
          facilityTypes: req.session.facilityTypes,
          qualifications: req.session.qualifications,
          countries: req.session.countries,
          spainStates: req.session.spainStates,
          provider: provider
        });
      }
    }
  );
});

// same as /edit returns health care provider's info but doesn't return dropdown data
router.get("/get/:id", async (req, res) => {
  DB.query(
    `SELECT
      H.ID, H.TITLEID, T.TITLE, H.FIRSTNAME, H.MIDDLENAME, H.LASTNAME, H.ORGANIZATIONNAME, H.FACILITYTYPE AS FACILITYTYPEID, FT.FACILITYTYPE, H.QUALIFICATION AS QUALIFICATIONID, Q.VALUE AS QUALIFICATION, H.ADDRESS, H.CITY, H.SPAINSTATE AS SPAINSTATEID, SS.SPAINSTATE, H.STATEORPROVINCE, H.COUNTRY AS COUNTRYID, C.NAME AS COUNTRY, H.ZIPCODE, H.PHONE, H.FAX, H.EMAILADDRESS, H.REGISTRATIONNO, H.ISACTIVE, H.ISPREFERREDPHONE, H.ISPREFERREDEMAIL, H.ISPREFERREDFAX
    FROM 
      healthcareprovider H
      INNER JOIN facilitytype FT ON H.FACILITYTYPE = FT.ID
      INNER JOIN qualification Q ON H.QUALIFICATION = Q.ID
      INNER JOIN spainstate SS ON H.SPAINSTATE = SS.ID
      INNER JOIN country C ON H.COUNTRY = C.ID
      INNER JOIN title T ON H.TITLEID = T.ID
    WHERE H.ID = ?`,
    [req.params.id],
    (err, rows) => {
      if (err || rows.length !== 1) {
        console.error(err, rows);
        res.status(500).send();
      } else {
        const provider = rows[0];
        if (provider.ISPREFERREDPHONE == "on") {
          provider.ISPREFERREDPHONE = "checked";
        }
        if (provider.ISPREFERREDFAX == "on") {
          provider.ISPREFERREDFAX = "checked";
        }
        if (provider.ISPREFERREDEMAIL == "on") {
          provider.ISPREFERREDEMAIL = "checked";
        }
        res.send(provider);
      }
    }
  );
});

// updates a health care provider's data in the DB
router.post("/update/:id", (req, res) => {
  const { id } = req.params;
  if (req.body.ISPREFERREDPHONE == undefined) {
    req.body.ISPREFERREDPHONE = "unchecked";
  }
  if (req.body.ISPREFERREDFAX == undefined) {
    req.body.ISPREFERREDFAX = "unchecked";
  }
  if (req.body.ISPREFERREDEMAIL == undefined) {
    req.body.ISPREFERREDEMAIL = "unchecked";
  }

  DB.query("UPDATE healthcareprovider SET ? WHERE ID = ?", [req.body, id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send();
    } else {
      res.status(204).send();
    }
  });
});

// MARK a health care provider as deleted in the DB, NOT actually delete it
router.get("/delete/:id", (req, res) => {
  const { id } = req.params;
  DB.query("UPDATE healthcareprovider SET ISDELETED = 1 WHERE ID = ?", [id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send();
    } else {
      res.status(204).send();
    }
  });
});

// MARK a health care provider as active
router.get("/active/:id", (req, res) => {
  const { id } = req.params;
  DB.query("UPDATE healthcareprovider SET ISACTIVE = 1 WHERE ID = ?", [id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send();
    } else {
      res.status(204).send();
    }
  });
});

// MARK a health care provider as inactive
router.get("/deactive/:id", (req, res) => {
  const { id } = req.params;
  DB.query("UPDATE healthcareprovider SET ISACTIVE = 0 WHERE ID = ?", [id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send();
    } else {
      res.status(204).send();
    }
  });
});

module.exports = { routes: router };
