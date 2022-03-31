const DB = require("../lib/db");

const newcaseintakeView = async (req, res) => {
  let providers = [];
  const promises = [];

  if (req.session.facilityTypes == undefined || req.session.facilityTypes.length <= 0) {
    const promise = new Promise((resolve) => {
      DB.query("SELECT * FROM facilitytype", (err, rows) => {
        req.session.facilityTypes = err ? [] : rows;
        if (err) console.error(err);
        resolve();
      });
    });
    promises.push(promise);
  }

  if (req.session.spainStates == undefined || req.session.spainStates.length <= 0) {
    const promise = new Promise((resolve) => {
      DB.query("SELECT * FROM spainstate", (err, rows) => {
        req.session.spainStates = err ? [] : rows;
        if (err) console.error(err);
        resolve();
      });
    });
    promises.push(promise);
  }

  if (req.session.countries == undefined || req.session.countries.length <= 0) {
    const promise = new Promise((resolve) => {
      DB.query("SELECT * FROM country", (err, rows) => {
        req.session.countries = err ? [] : rows;
        if (err) console.error(err);
        resolve();
      });
    });
    promises.push(promise);
  }

  const promise = new Promise((resolve) => {
    DB.query(
      `SELECT
        F.ID, F.FIRSTNAME, F.MIDDLENAME, F.LASTNAME, FT.facilitytype, F.ADDRESS, F.CITY, SS.spainstate, F.ISACTIVE AS STATUS, F.STATEORPROVINCE, C.NAME AS country
      FROM 
        healthcareprovider F
        INNER JOIN country C ON C.ID = F.country
        INNER JOIN spainstate SS ON SS.ID= F.spainstate
        INNER JOIN facilitytype FT ON FT.ID = F.facilitytype
      WHERE F.ISDELETED = 0  AND F.ISACTIVE = 1
      ORDER BY F.ID DESC`,
      (err, rows) => {
        providers = err ? [] : rows;
        if (err) console.error(err);
        resolve();
      }
    );
  });
  promises.push(promise);

  await Promise.all(promises);

  res.send({
    countries: req.session.countries,
    spainStates: req.session.spainStates,
    facilityTypes: req.session.facilityTypes,
    providers: providers
  });
};

const allcaseintakeView = async (req, res, next) => {
  const facilities = await new Promise((resolve) => {
    DB.query(
      `SELECT
        F.ID, F.ISACTIVE AS STATUS, F.FACILITYNAME, FT.facilitytype, F.ADDRESS, F.CITY, SS.spainstate, F.STATEORPROVINCE, C.NAME AS country
      FROM
        facility F
        INNER JOIN country C ON C.ID = F.country
        INNER JOIN spainstate SS ON SS.ID=F.spainstate
        INNER JOIN facilitytype FT ON FT.ID = F.facilitytype
      WHERE ISDELETED = 0
      ORDER BY F.ID DESC`,
      (err, rows) => {
        if (err) console.error(err);
        resolve(err ? [] : rows);
      }
    );
  });
  res.send({ facilities });
};

const allShippingView = (req, res, next) => {
  DB.query(
    `SELECT
      S.ID, S.ISACTIVE AS STATUS, S.SHIPTOCONTACT, S.FACILITYNAME, FT.FACILITYTYPE, S.ADDRESS, S.CITY, SS.SPAINSTATE, S.STATEORPROVINCE, C.NAME AS country
    FROM 
      facilityshippingaddress S
      INNER JOIN country C ON C.ID = S.COUNTRY
      INNER JOIN spainstate SS ON SS.ID = S.SPAINSTATE
      INNER JOIN facilitytype FT ON FT.ID = S.FACILITYID
    ORDER BY S.ID DESC`,
    function (err, rows) {
      if (err) {
        console.error(err);
        res.status(500).send({ status: "error", error: "internal server error" });
      } else {
        res.send({ shipping: rows });
      }
    }
  );
};

const newProviderView = async (req, res, next) => {
  if (req.session.facilityTypes == undefined || req.session.facilityTypes.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT * from facilitytype", function (err, rows) {
        req.session.facilityTypes = err ? [] : rows;
        if (err) console.log(err);
        resolve();
      });
    });
  }

  if (req.session.titles == undefined || req.session.titles.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT * from title", function (err, rows) {
        req.session.titles = err ? [] : rows;
        if (err) console.log(err);
        resolve();
      });
    });
  }

  if (req.session.qualifications == undefined || req.session.qualifications.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT * from qualification", function (err, rows) {
        req.session.qualifications = err ? [] : rows;
        if (err) console.log(err);
        resolve();
      });
    });
  }

  if (req.session.countries == undefined || req.session.countries.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT * from country", function (err, rows) {
        req.session.countries = err ? [] : rows;
        if (err) console.log(err);
        resolve();
      });
    });
  }

  if (req.session.spainStates == undefined || req.session.spainStates.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT * from spainstate", function (err, rows) {
        req.session.spainStates = err ? [] : rows;
        if (err) console.log(err);
        resolve();
      });
    });
  }

  res.send({
    titles: req.session.titles,
    facilityTypes: req.session.facilityTypes,
    qualifications: req.session.qualifications,
    countries: req.session.countries,
    spainStates: req.session.spainStates
  });
};

const allProvidersView = (req, res, next) => {
  DB.query(
    "SELECT " +
      "F.ID," +
      "TT.TITLE," +
      "F.FIRSTNAME," +
      "F.MIDDLENAME," +
      "F.LASTNAME," +
      "F.ISACTIVE AS STATUS, " +
      "FT.facilitytype," +
      "F.ADDRESS," +
      "F.CITY," +
      "Q.VALUE AS SPECIALITY," +
      "SS.spainstate," +
      "F.STATEORPROVINCE," +
      "C.NAME AS country " +
      "FROM " +
      "healthcareprovider F " +
      "INNER JOIN country C ON C.ID = F.country " +
      "INNER JOIN spainstate SS ON SS.ID= F.spainstate " +
      "INNER JOIN facilitytype FT ON FT.ID = F.facilitytype " +
      "INNER JOIN title TT ON TT.ID = F.TITLEID " +
      "INNER JOIN qualification Q ON Q.ID = F.qualification " +
      "WHERE F.ISDELETED = 0 " +
      "ORDER BY F.ID DESC",
    function (err, rows) {
      if (err) {
        console.log(err);
        res.status(500).send();
      } else {
        res.send({ providers: rows });
      }
    }
  );
};

const newProductView = async (req, res, next) => {
  if (req.session.productType == undefined || req.session.productType.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT ID, PRODUCTTYPE FROM producttype WHERE ISACTIVE = 1", function (err, rows) {
        req.session.productType = err ? [] : rows;
        if (err) console.log(err);
        resolve();
      });
    });
  }

  if (req.session.StrengthUnit == undefined || req.session.StrengthUnit.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT ID,UNIT FROM strengthunit WHERE ISACTIVE = 1", function (err, rows) {
        req.session.StrengthUnit = err ? [] : rows;
        if (err) console.log(err);
        resolve();
      });
    });
  }

  if (req.session.FORMULATION == undefined || req.session.FORMULATION.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT ID, FORMULATION FROM formulation WHERE ISACTIVE = 1", function (err, rows) {
        req.session.FORMULATION = err ? [] : rows;
        if (err) console.log(err);
        resolve();
      });
    });
  }

  if (req.session.countries == undefined || req.session.countries.length <= 0) {
    await new Promise((resolve) => {
      DB.query("SELECT * from country", function (err, rows) {
        req.session.countries = err ? [] : rows;
        if (err) console.log(err);
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
        "SELECT ID, CODE, DESCRIPTION FROM routeofadministration WHERE ISACTIVE =1;",
        function (err, rows) {
          req.session.ROUTEOFADMINISTRATION = err ? [] : rows;
          if (err) console.log(err);
          resolve();
        }
      );
    });
  }

  res.send({
    productTypes: req.session.productType,
    StrengthUnits: req.session.StrengthUnit,
    FORMULATIONs: req.session.FORMULATION,
    countries: req.session.countries,
    ROUTEOFADMINISTRATIONs: req.session.ROUTEOFADMINISTRATION
  });
};

const allProductsView = (req, res, next) => {
  DB.query("SELECT * from v_productinfo", function (err, rows) {
    if (err) {
      console.log(err);
      res.status(500).send();
    } else {
      res.send({ products: rows });
    }
  });
};

const newProgramView = (req, res, next) => {
  var products = [];
  var providers = [];
  var program = null;
  var subListCounts = null;
  var programregistrationinfolist = [];
  var programproductinfolist = [];
  var programproviderlist = [];

  if (req.session.programTypes == undefined || req.session.programTypes.length <= 0) {
    DB.query(
      "SELECT ID, CODE, PROGRAMTYPE FROM PROGRAMTYPE WHERE ISACTIVE =1",
      function (err, rows) {
        if (err) {
          console.log(err);
          req.session.programTypes = [];
        } else {
          req.session.programTypes = rows;
        }
      }
    );
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

  if (req.session.productTypes == undefined || req.session.productTypes.length <= 0) {
    DB.query("SELECT ID, PRODUCTTYPE FROM PRODUCTTYPE WHERE ISACTIVE =1", function (err, rows) {
      if (err) {
        console.log(err);
        req.session.productTypes = [];
      } else {
        req.session.productTypes = rows;
      }
    });
  }

  DB.query(
    "SELECT P.ID AS PRODUCTID,P.PRODUCTNAME, PT.PRODUCTTYPE FROM PRODUCTS P " +
      "INNER JOIN PRODUCTTYPE PT ON PT.ID=P.PRODUCTTYPEID " +
      "WHERE P.ISACTIVE =1 AND P.ISDELETED = 0",
    function (err, rows) {
      if (err) {
        console.log(err);
        products = [];
      } else {
        products = rows;
      }
    }
  );

  if (req.session.providerTypes == undefined || req.session.providerTypes.length <= 0) {
    DB.query(
      "SELECT ID, facilitytype AS PROVIDERTYPE FROM facilitytype WHERE ISACTIVE =1",
      function (err, rows) {
        if (err) {
          console.log(err);
          req.session.providerTypes = [];
        } else {
          req.session.providerTypes = rows;
        }
      }
    );
  }

  DB.query(
    "SELECT P.ID AS PROVIDERID, CONCAT(P.FIRSTNAME) AS PROVIDERNAME, PT.facilitytype AS PROVIDERTYPE FROM healthcareprovider P " +
      "INNER JOIN facilitytype PT ON PT.ID=P.facilitytype " +
      "WHERE    P.ISACTIVE =1 AND P.ISDELETED =0",
    function (err, rows) {
      if (err) {
        console.log(err);
        providers = [];
      } else {
        providers = rows;
      }
    }
  );

  // console.log("Program ID ==== " + req.session.lastSavedProgramId);
  if (req.session.lastSavedProgramId != undefined) {
    DB.query(
      "SELECT  id, COUNT(DISTINCT PROGRAMREGISRATIONINFOID) AS PRICOUNT,COUNT(DISTINCT PROGRAMPRODUCTID) AS PRODUCTCOUNT, count(DISTINCT PROGRAMPROVIDERID) AS PROVIDERCOUNT FROM v_PROGRAMINFOCOUNT where id = " +
        req.session.lastSavedProgramId +
        " group by id ",
      function (err, rows) {
        if (err) {
          console.log(err);
        } else {
          subListCounts = rows[0];
        }
      }
    );

    DB.query(
      "SELECT * from v_programinfo where id = " + req.session.lastSavedProgramId,
      function (err, rows) {
        if (err) {
          console.log(err);
          programregistrationinfolist = [];
        } else {
          program = rows[0];
          programregistrationinfolist = rows;
        }
      }
    );

    DB.query(
      "SELECT * from v_programproductinfo where id = " + req.session.lastSavedProgramId,
      function (err, rows) {
        if (err) {
          console.log(err);
          programproductinfolist = [];
        } else {
          programproductinfolist = rows;
          console.log(
            "programproductinfolist -====---====---===---===--=== ",
            programproductinfolist
          );
        }
      }
    );

    DB.query(
      "SELECT * from v_programproviderinfo where id = " + req.session.lastSavedProgramId,
      function (err, rows) {
        if (err) {
          console.log(err);
          programproviderlist = [];
        } else {
          programproviderlist = rows;
          console.log("programproviderlist -====---====---===---===--=== ", programproviderlist);
        }
      }
    );
  }

  setTimeout(function () {
    res.render("program/new-program", {
      program: program,
      programTypes: req.session.programTypes,
      countries: req.session.countries,
      programregistrationinfolist: programregistrationinfolist,
      productTypes: req.session.productTypes,
      products: products,
      programproductinfolist: programproductinfolist,
      providerTypes: req.session.providerTypes,
      providers: providers,
      programproviderlist: programproviderlist,
      subListCounts: subListCounts
    });
  }, 500);
};

const allProgramsView = (req, res) => {
  req.session.lastSavedProgramId = undefined;
  DB.query(
    "SELECT ID, PROGRAMNAME, ISACTIVE AS STATUS from programs WHERE ISDELETED = 0",
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else {
        res.json(result);
      }
    }
  );
};

module.exports = {
  newcaseintakeView,
  newProviderView,
  allcaseintakeView,
  allShippingView,
  allProvidersView,
  newProductView,
  allProductsView,
  newProgramView,
  allProgramsView
};
