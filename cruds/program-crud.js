const express = require("express");
const router = express.Router();
const DB = require("../lib/db");
const { payloadChecker } = require("../lib/helpers");

router.use(payloadChecker);

router.get("/getProgramTypes", (req, res) => {
  DB.query("SELECT ID, PROGRAMTYPE AS NAME FROM programtype", (err, result) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.json(result);
    }
  });
});

router.get("/getCountries", (req, res) => {
  DB.query("SELECT ID, NAME FROM country", (err, result) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.json(result);
    }
  });
});

router.get("/getFacilityIds", (req, res) => {
  const { search } = req.query;
  DB.query(
    "SELECT ID FROM facility WHERE CONVERT(ID, CHAR) LIKE ?",
    `${search}%`,
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else {
        res.json(result);
      }
    }
  );
});

router.get("/getHealthCareProviderIds", (req, res) => {
  const { search } = req.query;
  DB.query(
    "SELECT ID FROM healthcareprovider WHERE CONVERT(ID, CHAR) LIKE ?",
    `${search}%`,
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else {
        res.json(result);
      }
    }
  );
});

router.get("/getProductIds", (req, res) => {
  const { search } = req.query;
  DB.query(
    "SELECT ID FROM products WHERE CONVERT(ID, CHAR) LIKE ?",
    `${search}%`,
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else {
        res.json(result);
      }
    }
  );
});

router.post("/add", async (req, res) => {
  let rollback = false;
  let connection = null;

  try {
    // get a connection from the pool
    connection = await new Promise((resolve, reject) => {
      DB.getConnection((err, connection) => {
        if (err) reject(err);
        else resolve(connection);
      });
    });

    // begin transaction
    await new Promise((resolve, reject) => {
      connection.beginTransaction((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    rollback = true;

    // insert program into DB
    const { program_name, program_type_id } = req.body;
    const programId = await new Promise((resolve, reject) => {
      connection.query(
        `INSERT INTO programs(PROGRAMNAME, PROGRAMCODE, PROGRAMTYPEID, CREATEDBY) VALUES(?, ?, ?, ?)`,
        [program_name, `${(Math.random() * 1e8) | 0}`, program_type_id, "Anonymous"],
        (err, result) => {
          if (err) reject(err);
          else resolve(result.insertId);
        }
      );
    });

    // insert program registration info into DB
    const { registration_info } = req.body;
    for (const info of registration_info) {
      const { registration_no, country_id } = info;
      await new Promise((resolve, reject) => {
        connection.query(
          `INSERT INTO programregistrationinfo(PROGRAMID, PROGRAMREGISTRATIONNO, REGISTRATIONCOUNTRY, CREATEDBY) VALUES(?, ?, ?, ?)`,
          [programId, registration_no, country_id, "Anonymous"],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // insert program's product ids into DB
    const { product_ids } = req.body;
    for (const productId of product_ids) {
      await new Promise((resolve, reject) => {
        connection.query(
          `INSERT INTO programproducts(PROGRAMID, PRODUCTID, CREATEDBY) VALUES(?, ?, ?)`,
          [programId, productId, "Anonymous"],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // insert program's facility ids into DB
    const { facility_ids } = req.body;
    for (const facilityId of facility_ids) {
      await new Promise((resolve, reject) => {
        connection.query(
          `INSERT INTO programfacilities(PROGRAMID, FACILITYID, CREATEDBY) VALUES(?, ?, ?)`,
          [programId, facilityId, "Anonymous"],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // insert program's health care provider ids into DB
    const { provider_ids } = req.body;
    for (const providerId of provider_ids) {
      await new Promise((resolve, reject) => {
        connection.query(
          `INSERT INTO programproviders(PROGRAMID, PROVIDERID, CREATEDBY) VALUES(?, ?, ?)`,
          [programId, providerId, "Anonymous"],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // everything was successfull, so commit the changes to the DB
    await new Promise((resolve, reject) => {
      connection.commit((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    rollback = false;

    // release the connection back to the pool
    connection.release();

    res.sendStatus(204);
  } catch (error) {
    console.error(error);

    // an error occurred when transaction was in process, so rollback all the changes
    if (rollback) {
      await new Promise((resolve) => {
        connection.rollback(() => {
          resolve();
        });
      });
    }

    // release the connection, if acquired, back to the pool
    if (connection !== null) {
      connection.release();
    }

    res.sendStatus(500);
  }
});

router.post("/add_old", function (req, res) {
  DB.query("INSERT INTO programs SET ?", req.body, function (err, result, fields) {
    if (err) {
      console.log("Error in saving program", err);
      res.status(500).send();
    } else {
      console.log("Program saved successfully");
      req.session.lastSavedProgramId = result.insertId;
      res.status(204).send();
    }
  });
});

router.post("/addProgramRegistrationInfo", function (req, res) {
  var form_data = req.body;
  form_data.PROGRAMID = req.session.lastSavedProgramId;
  DB.query("INSERT INTO PROGRAMREGISTRATIONINFO SET ?", form_data, function (err, result, fields) {
    if (err) {
      req.flash("error", err);
      res.redirect("/newprogram");
    } else {
      console.log("Program registration information saved successfully");
      req.flash("success", "Program registration information saved successfully");
      res.redirect("/newprogram");
    }
  });
});

router.post("/addProgramProductInfo", function (req, res) {
  var form_data = req.body;
  form_data.PROGRAMID = req.session.lastSavedProgramId;
  DB.query("INSERT INTO PROGRAMPRODUCTS SET ?", form_data, function (err, result, fields) {
    if (err) {
      req.flash("error", err);
      res.redirect("/newprogram");
    } else {
      console.log("Program product associated successfully");
      req.flash("success", "Program product associated successfully");
      res.redirect("/newprogram");
    }
  });
});

router.post("/addProgramProviderInfo", function (req, res) {
  var form_data = req.body;
  form_data.PROGRAMID = req.session.lastSavedProgramId;
  DB.query("INSERT INTO PROGRAMPROVIDERS SET ?", form_data, function (err, result, fields) {
    if (err) {
      req.flash("error", err);
      res.redirect("/newprogram");
    } else {
      console.log("Program provider associated successfully");
      req.flash("success", "Program provider associated successfully");
      res.redirect("/newprogram");
    }
  });
});

router.get("/deleteProgramRegistrationInfo/(:id)", function (req, res, next) {
  let id = req.params.id;
  DB.query(
    "UPDATE programregistrationinfo SET ISACTIVE = 0 WHERE id = " + id,
    function (err, result) {
      if (err) {
        req.flash("error", err);
        res.redirect("/newprogram");
      } else {
        req.flash("success", "Program registration information deleted successfully");
        res.redirect("/newprogram");
      }
    }
  );
});

router.get("/deleteProgramProduct/(:id)", function (req, res, next) {
  let id = req.params.id;
  DB.query("UPDATE PROGRAMPRODUCTS SET ISACTIVE = 0 WHERE id = " + id, function (err, result) {
    if (err) {
      req.flash("error", err);
      res.redirect("/newprogram");
    } else {
      req.flash("success", "Program product association deleted successfully");
      res.redirect("/newprogram");
    }
  });
});

router.get("/deleteProgramProvider/(:id)", function (req, res, next) {
  let id = req.params.id;
  DB.query("UPDATE PROGRAMPROVIDERS SET ISACTIVE = 0 WHERE id = " + id, function (err, result) {
    if (err) {
      req.flash("error", err);
      res.redirect("/newprogram");
    } else {
      req.flash("success", "Program provider association deleted successfully");
      res.redirect("/newprogram");
    }
  });
});

router.get("/edit/(:id)", function (req, res, next) {
  if (req.session.productType == undefined || req.session.productType.length <= 0) {
    DB.query("SELECT ID, PRODUCTTYPE FROM PRODUCTTYPE WHERE ISACTIVE =1", function (err, rows) {
      if (err) {
        console.log(err);
        req.session.productType = [];
      } else {
        req.session.productType = rows;
      }
    });
  }

  if (req.session.StrengthUnit == undefined || req.session.StrengthUnit.length <= 0) {
    DB.query("SELECT ID,UNIT FROM STRENGTHUNIT WHERE ISACTIVE =1", function (err, rows) {
      if (err) {
        console.log(err);
        req.session.StrengthUnit = [];
      } else {
        req.session.StrengthUnit = rows;
      }
    });
  }

  if (req.session.FORMULATION == undefined || req.session.FORMULATION.length <= 0) {
    DB.query("SELECT ID, FORMULATION FROM FORMULATION WHERE ISACTIVE =1;", function (err, rows) {
      if (err) {
        console.log(err);
        req.session.FORMULATION = [];
      } else {
        req.session.FORMULATION = rows;
      }
    });
  }

  if (req.session.countries == undefined || req.session.countries.length <= 0) {
    DB.query("SELECT * from country", function (err, rows) {
      if (err) {
        console.log(err);
        req.session.countries = [];
      } else {
        req.session.countries = rows;
      }
    });
  }

  if (
    req.session.ROUTEOFADMINISTRATION == undefined ||
    req.session.ROUTEOFADMINISTRATION.length <= 0
  ) {
    DB.query(
      "SELECT ID, CODE, DESCRIPTION FROM ROUTEOFADMINISTRATION WHERE ISACTIVE =1;",
      function (err, rows) {
        if (err) {
          console.log(err);
          req.session.ROUTEOFADMINISTRATION = [];
        } else {
          req.session.ROUTEOFADMINISTRATION = rows;
        }
      }
    );
  }

  DB.query("SELECT * from v_PRODUCTINFO WHERE ID = " + req.params.id, function (err, rows, fields) {
    if (rows.length <= 0) {
      req.flash("error", "Product not found");
      res.redirect("/allProductsView");
    } else {
      var products = rows[0];
      res.render("product/edit-product", {
        productTypes: req.session.productType,
        StrengthUnits: req.session.StrengthUnit,
        FORMULATIONs: req.session.FORMULATION,
        countries: req.session.countries,
        ROUTEOFADMINISTRATIONs: req.session.ROUTEOFADMINISTRATION,
        product: products
      });
    }
  });
});

router.post("/update/:id", function (req, res, next) {
  let errors = false;
  console.log("PRODUCT TO UPDATE", req.body);
  if (!errors) {
    DB.query("UPDATE products SET ? WHERE id = " + req.params.id, req.body, function (err, result) {
      if (err) {
        console.log(err);
        req.flash("error", err);
        res.render("product/edit-product", {
          product: req.body
        });
      } else {
        req.flash("success", "Product updated successfully");
        res.redirect("/allProductsView");
      }
    });
  }
});

router.get("/delete/:id", function (req, res) {
  const { id } = req.params;
  DB.query("UPDATE programs SET ISDELETED = 1 WHERE ID = ?", id, (err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(204);
    }
  });
});

router.get("/active/:id", (req, res) => {
  const { id } = req.params;
  DB.query("UPDATE programs SET ISACTIVE = 1 WHERE ID = ?", id, (err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(204);
    }
  });
});

router.get("/deactive/:id", (req, res) => {
  const { id } = req.params;
  DB.query("UPDATE programs SET ISACTIVE = 0 WHERE ID = ?", id, (err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(204);
    }
  });
});

// get information of a program by its id
router.get("/get/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // get program info
    const program = await new Promise((resolve, reject) => {
      DB.query(
        `SELECT P.ID, P.PROGRAMNAME, P.PROGRAMTYPEID, PT.PROGRAMTYPE
        FROM programs P INNER JOIN programtype PT ON P.PROGRAMTYPEID = PT.ID
        WHERE P.ID = ?`,
        id,
        (err, result) => {
          if (err) {
            reject(err);
          } else if (result.length !== 1) {
            const error = new Error(`Invalid result: ${JSON.stringify(result)}`);
            reject(error);
          } else {
            resolve(result[0]);
          }
        }
      );
    });

    // get registration info for the program
    const registrationInfo = await new Promise((resolve, reject) => {
      DB.query(
        `SELECT 
          PRI.PROGRAMREGISTRATIONNO, PRI.REGISTRATIONCOUNTRY AS REGISTRATIONCOUNTRYID, C.NAME AS REGISTRATIONCOUNTRY
        FROM 
          programregistrationinfo PRI
          INNER JOIN country C ON PRI.REGISTRATIONCOUNTRY = C.ID
        WHERE PRI.PROGRAMID = ?`,
        id,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });

    // get linked product ids for the program
    const productIds = await new Promise((resolve, reject) => {
      DB.query(`SELECT PRODUCTID FROM programproducts WHERE PROGRAMID = ?`, id, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    // get linked facility ids for the program
    const facilityIds = await new Promise((resolve, reject) => {
      DB.query(
        `SELECT FACILITYID FROM programfacilities WHERE PROGRAMID = ?`,
        id,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });

    // get linked health care provider ids for the program
    const providerIds = await new Promise((resolve, reject) => {
      DB.query(`SELECT PROVIDERID FROM programproviders WHERE PROGRAMID = ?`, id, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    res.json({ program, registrationInfo, productIds, facilityIds, providerIds });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// update information of a program by its id
router.get("/update/:id", async (req, res) => {
  const { id } = req.params;
  let rollback = false;
  let connection = null;

  try {
    // get a connection from the pool
    connection = await new Promise((resolve, reject) => {
      DB.getConnection((err, connection) => {
        if (err) reject(err);
        else resolve(connection);
      });
    });

    // begin transaction
    await new Promise((resolve, reject) => {
      connection.beginTransaction((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    rollback = true;

    // update program info in DB
    const { program_name, program_type_id } = req.body;
    await new Promise((resolve, reject) => {
      connection.query(
        `UPDATE programs SET PROGRAMNAME = ?, PROGRAMTYPEID = ? WHERE ID = ?`,
        [program_name, program_type_id, id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result.insertId);
        }
      );
    });

    // delete old program registration info from DB
    await new Promise((resolve, reject) => {
      connection.query(`DELETE FROM programregistrationinfo WHERE PROGRAMID = ?`, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // insert new program registration info into DB
    const { registration_info } = req.body;
    for (const info of registration_info) {
      const { registration_no, country_id } = info;
      await new Promise((resolve, reject) => {
        connection.query(
          `INSERT INTO programregistrationinfo(PROGRAMID, PROGRAMREGISTRATIONNO, REGISTRATIONCOUNTRY, CREATEDBY) VALUES(?, ?, ?, ?)`,
          [id, registration_no, country_id, "Anonymous"],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // delete old program's product info from DB
    await new Promise((resolve, reject) => {
      connection.query(`DELETE FROM programproducts WHERE PROGRAMID = ?`, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // insert program's product ids into DB
    const { product_ids } = req.body;
    for (const productId of product_ids) {
      await new Promise((resolve, reject) => {
        connection.query(
          `INSERT INTO programproducts(PROGRAMID, PRODUCTID, CREATEDBY) VALUES(?, ?, ?)`,
          [id, productId, "Anonymous"],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // delete old program's facility info from DB
    await new Promise((resolve, reject) => {
      connection.query(`DELETE FROM programfacilities WHERE PROGRAMID = ?`, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // insert program's facility ids into DB
    const { facility_ids } = req.body;
    for (const facilityId of facility_ids) {
      await new Promise((resolve, reject) => {
        connection.query(
          `INSERT INTO programfacilities(PROGRAMID, FACILITYID, CREATEDBY) VALUES(?, ?, ?)`,
          [id, facilityId, "Anonymous"],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // delete old program's health care provider info from DB
    await new Promise((resolve, reject) => {
      connection.query(`DELETE FROM programproviders WHERE PROGRAMID = ?`, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // insert program's health care provider info into DB
    const { provider_ids } = req.body;
    for (const providerId of provider_ids) {
      await new Promise((resolve, reject) => {
        connection.query(
          `INSERT INTO programproviders(PROGRAMID, PROVIDERID, CREATEDBY) VALUES(?, ?, ?)`,
          [id, providerId, "Anonymous"],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // everything was successfull, so commit the changes to the DB
    await new Promise((resolve, reject) => {
      connection.commit((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    rollback = false;

    // release the connection back to the pool
    connection.release();

    res.sendStatus(204);
  } catch (error) {
    console.error(error);

    // an error occurred when transaction was in process, so rollback all the changes
    if (rollback) {
      await new Promise((resolve) => {
        connection.rollback(() => {
          resolve();
        });
      });
    }

    // release the connection, if acquired, back to the pool
    if (connection !== null) {
      connection.release();
    }

    res.sendStatus(500);
  }
});

module.exports = {
  routes: router
};
