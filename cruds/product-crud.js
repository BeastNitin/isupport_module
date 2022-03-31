const express = require("express");
const router = express.Router();
const DB = require("../lib/db");
const { payloadChecker } = require("../lib/helpers");

router.use(payloadChecker);

// add a product
router.post("/add", (req, res) => {
  req.body.CREATEDBY = "Anonymous";
  DB.query("INSERT INTO products SET ?", req.body, (err) => {
    if (err) {
      console.log("Error in saving product.");
      console.log(err);
      res.status(500).send();
    } else {
      console.log("Product saved successfully");
      res.status(204).send();
    }
  });
});

// get product info (used to populate edit product form fields)
router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;

  if (req.session.productType == undefined || req.session.productType.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT ID, PRODUCTTYPE FROM producttype WHERE ISACTIVE = 1", (err, rows) => {
        req.session.productType = err ? [] : rows;
        if (err) console.error(err);
        resolve();
      });
    });
  }

  if (req.session.StrengthUnit == undefined || req.session.StrengthUnit.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT ID, UNIT FROM strengthunit WHERE ISACTIVE = 1", (err, rows) => {
        req.session.StrengthUnit = err ? [] : rows;
        if (err) console.error(err);
        resolve();
      });
    });
  }

  if (req.session.FORMULATION == undefined || req.session.FORMULATION.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT ID, FORMULATION FROM formulation WHERE ISACTIVE = 1", (err, rows) => {
        req.session.FORMULATION = err ? [] : rows;
        if (err) console.error(err);
        resolve();
      });
    });
  }

  if (req.session.countries == undefined || req.session.countries.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT * from country", (err, rows) => {
        req.session.countries = err ? [] : rows;
        if (err) console.error(err);
        resolve();
      });
    });
  }

  if (
    req.session.ROUTEOFADMINISTRATION == undefined ||
    req.session.ROUTEOFADMINISTRATION.length <= 0
  ) {
    await new Promise((resolve) => {
      DB.query(
        "SELECT ID, CODE, DESCRIPTION FROM routeofadministration WHERE ISACTIVE = 1",
        (err, rows) => {
          req.session.ROUTEOFADMINISTRATION = err ? [] : rows;
          if (err) console.error(err);
          resolve();
        }
      );
    });
  }

  DB.query(
    `SELECT
      P.ID, P.PRODUCTNAME, P.GENRICNAME, P.PRODUCTTYPEID, PT.PRODUCTTYPE, P.STRENGTH, P.UNITID, SU.UNIT, P.FORMULATIONID, F.FORMULATION, P.ROUTOFADMINISTRATION AS ROUTOFADMINISTRATIONID, R.DESCRIPTION AS ROUTOFADMINISTRATION, P.APPROVALNO, P.AUTHORIZATIONHOLDERNAME, P.COUNTRYAUTHORIZED AS COUNTRYAUTHORIZEDID,  C.NAME AS COUNTRYAUTHORIZED, P.WHODDCODE, P.ATCCODE, P.COMMENTS, P.ISACTIVE
    FROM
      products P
      INNER JOIN producttype PT ON P.PRODUCTTYPEID = PT.ID
      INNER JOIN strengthunit SU ON P.UNITID = SU.ID
      INNER JOIN formulation F ON P.FORMULATIONID = F.ID
      INNER JOIN country C ON P.COUNTRYAUTHORIZED = C.ID
      INNER JOIN routeofadministration R ON P.ROUTOFADMINISTRATION = R.ID
    WHERE P.ID = ?`,
    [id],
    (err, rows) => {
      if (err || rows.length !== 1) {
        console.error(err, rows);
        res.status(500).send();
      } else {
        res.send({
          productTypes: req.session.productType,
          StrengthUnits: req.session.StrengthUnit,
          FORMULATIONs: req.session.FORMULATION,
          countries: req.session.countries,
          ROUTEOFADMINISTRATIONs: req.session.ROUTEOFADMINISTRATION,
          product: rows[0]
        });
      }
    }
  );
});

// get product info (same as /edit but doesnt return data for dropdowns)
router.get("/get/:id", async (req, res) => {
  const { id } = req.params;
  DB.query(
    `SELECT
      P.ID, P.PRODUCTNAME, P.GENRICNAME, P.PRODUCTTYPEID, PT.PRODUCTTYPE, P.STRENGTH, P.UNITID, SU.UNIT, P.FORMULATIONID, F.FORMULATION, P.ROUTOFADMINISTRATION AS ROUTOFADMINISTRATIONID, R.DESCRIPTION AS ROUTOFADMINISTRATION, P.APPROVALNO, P.AUTHORIZATIONHOLDERNAME, P.COUNTRYAUTHORIZED AS COUNTRYAUTHORIZEDID,  C.NAME AS COUNTRYAUTHORIZED, P.WHODDCODE, P.ATCCODE, P.COMMENTS, P.ISACTIVE
    FROM
      products P
      INNER JOIN producttype PT ON P.PRODUCTTYPEID = PT.ID
      INNER JOIN strengthunit SU ON P.UNITID = SU.ID
      INNER JOIN formulation F ON P.FORMULATIONID = F.ID
      INNER JOIN country C ON P.COUNTRYAUTHORIZED = C.ID
      INNER JOIN routeofadministration R ON P.ROUTOFADMINISTRATION = R.ID
    WHERE P.ID = ?`,
    [id],
    (err, rows) => {
      if (err || rows.length !== 1) {
        console.error(err, rows);
        res.status(500).send();
      } else {
        res.send(rows[0]);
      }
    }
  );
});

// update a product info in the DB
router.post("/update/:id", function (req, res, next) {
  const { id } = req.params;
  DB.query("UPDATE products SET ? WHERE id = ?", [req.body, id], (err) => {
    if (err) {
      console.log(err);
      res.status(500).send();
    } else {
      res.status(204).send();
    }
  });
});

// MARK a product as deleted in the DB, NOT actually delete it
router.get("/delete/(:id)", (req, res) => {
  const { id } = req.params;
  DB.query("UPDATE products SET ISDELETED = 1 WHERE ID = ?", [id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send();
    } else {
      res.status(204).send();
    }
  });
});

// Mark a product as active
router.get("/active/(:id)", (req, res) => {
  const { id } = req.params;
  DB.query("UPDATE products SET ISACTIVE = 1 WHERE ID = ?", [id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send();
    } else {
      res.status(204).send();
    }
  });
});

// Mark a product as inactive
router.get("/deactive/(:id)", (req, res) => {
  const { id } = req.params;
  console.log("Deactivate: ", id);
  DB.query("UPDATE products SET ISACTIVE = 0 WHERE ID = ?", [id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send();
    } else {
      res.status(204).send();
    }
  });
});

module.exports = { routes: router };
