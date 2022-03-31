const express = require("express");
const router = express.Router();
const DB = require("../lib/db");
const { payloadChecker } = require("../lib/helpers");

router.use(payloadChecker);

// insert a new facility along with the shipping address
// router.post("/insert", async (req, res) => {
//   let facilityId = -1;
//   try {
//     facilityId = await new Promise((resolve, reject) => {
//       DB.query(
//         "INSERT INTO facility(FACILITYNAME, FACILITYTYPE, ADDRESS, CITY, SPAINSTATE, STATEORPROVINCE, COUNTRY, ZIPCODE, PHONE, FAX, EMAILADDRESS, REGISTRATIONNO, CREATEDBY) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//         [
//           req.body.facility_name,
//           req.body.facility_type,
//           req.body.facility_address,
//           req.body.facility_city,
//           req.body.facility_state,
//           req.body.facility_STATEORPROVINCE,
//           req.body.facility_country,
//           req.body.facility_zipcode,
//           req.body.facility_phoneno,
//           req.body.facility_fax,
//           req.body.facility_email,
//           req.body.facility_registration,
//           "Anonymous"
//         ],
//         (err, result) => {
//           if (err) reject(error);
//           resolve(result.insertId);
//         }
//       );
//     });

//     await new Promise((resolve, reject) => {
//       DB.query(
//         "INSERT INTO facilityshippingaddress (FACILITYID, SHIPTOCONTACT, FACILITYNAME, ADDRESS, CITY, SPAINSTATE, STATEORPROVINCE, COUNTRY, ZIPCODE, PHONE, FAX, EMAILADDRESS, CREATEDBY) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//         [
//           facilityId,
//           req.body.shipping_contact_name,
//           req.body.shipping_facility_name,
//           req.body.shipping_address,
//           req.body.shipping_city,
//           req.body.shipping_state,
//           req.body.shipping_STATEORPROVINCE,
//           req.body.shipping_country,
//           req.body.shipping_zipcode,
//           req.body.shipping_phoneno,
//           req.body.shipping_fax,
//           req.body.shipping_email,
//           "Anonymous"
//         ],
//         (err, result) => {
//           if (err) reject(err);
//           else resolve();
//         }
//       );
//     });

//     res.status(204).send();
//   } catch (error) {
//     console.error(error);
//     res.status(500).send();
//     // if 2nd query fails then revert the 1st query insertion
//     if (facilityId !== -1) {
//       await new Promise((resolve) => {
//         DB.query("DELETE FROM facility WHERE ID = ?", [facilityId], (err) => {
//           if (err) console.error(err);
//           resolve();
//         });
//       });
//     }
//   }
// });

// old endpoint, use /create instead of this
router.post("/add", (req, res) => {
  DB.query(
    "INSERT INTO case_intake_initiate (general_awareness_date,general_processing_center_recieved_date,general_Primary_source_country,general_report_type,general_case_significance,general_adverse_event_type,general_reference_no,program_id,program_name,patient_id,patient_intials,patient_gender,patient_dob,patient_age,patient_age_unit,patient_age_group,Reporter_first_name,Reporter_last_name,Reporter_organisation_name,Reporter_country,Reporter_report_type,product_name,product_generic_name,event_adverse_event,event_onset_date,event_case_serious,event_outcome,event_country_of_occurence) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)",
    [
      req.body.general_awareness_date,
      req.body.general_processing_center_recieved_date,
      req.body.general_Primary_source_country,
      req.body.general_report_type,
      req.body.general_case_significance,
      req.body.general_adverse_event_type,
      req.body.general_reference_no,
      req.body.program_id,
      req.body.program_name,
      req.body.patient_id,
      req.body.patient_intials,
      req.body.patient_gender,
      req.body.patient_dob,
      req.body.patient_age,
      req.body.patient_age_unit,
      req.body.patient_age_group,
      req.body.Reporter_first_name,
      req.body.Reporter_last_name,
      req.body.Reporter_organisation_name,
      req.body.Reporter_country,
      eq.body.Reporter_report_type,
      req.body.product_name,
      req.body.product_generic_name,
      req.body.event_adverse_event,
      req.body.event_onset_date,
      req.body.event_case_serious,
      req.body.event_outcome,
      req.body.event_country_of_occurence, 
    ],
    (err, result) => {
      if (err) {
        console.log("Error in adding case.");
        console.log(err);
        res.status(500).send({ error: "Internal server error" });
      } else {
        console.log("case added successfully");
        return res.json(result);
        // req.session.lastAddedFacilityId = result.insertId;
        //res.status(204).send();
      }
    }
  );
});

// router.post("/linkproviders", async function (req, res) {
//   const { lastAddedFacilityId } = req.session;
//   if (!lastAddedFacilityId) {
//     res.status(400).send({ error: "session error, lastAddedFacilityId is undefined." });
//     return;
//   }

//   if (!req.body.provider) {
//     res.status(400).send({ error: "no provider selected to link." });
//     return;
//   }

//   const promises = [];
//   if (req.body.provider.length == 1) {
//     const promise = new Promise((resolve, reject) => {
//       DB.query(
//         "INSERT INTO facilityprovider (FACILITYID, PROVIDERID, CREATEDBY) VALUES (?, ?, ?)",
//         [lastAddedFacilityId, req.body.provider, "Mubasher"],
//         function (err, result, fields) {
//           if (err) reject(err);
//           else resolve();
//         }
//       );
//     });
//     promises.push(promise);
//   } else if (req.body.provider.length > 1) {
//     req.body.provider.forEach((element) => {
//       const promise = new Promise((resolve, reject) => {
//         DB.query(
//           "INSERT INTO facilityprovider (FACILITYID, PROVIDERID, CREATEDBY) VALUES (?, ?, ?)",
//           [lastAddedFacilityId, element, "Mubasher"],
//           function (err, result, fields) {
//             if (err) reject(err);
//             else resolve();
//           }
//         );
//       });
//       promises.push(promise);
//     });
//   }

//   try {
//     await Promise.all(promises);
//     console.log("Providers Linked Successfully");
//     res.status(204).send();
//   } catch (err) {
//     console.log("Error in linking providers to this facility.");
//     console.log(err);
//     res.status(500).send({ error: "internal server error" });
//   }
// });

// router.post("/updatelinkproviders/(:id)", async function (req, res) {
//   try {
//     await new Promise((resolve, reject) => {
//       DB.query(
//         "DELETE FROM facilityprovider WHERE FACILITYID = ?",
//         [req.params.id],
//         function (err, result, fields) {
//           if (err) {
//             console.log("Error in deleting already linked providers");
//             reject(err);
//           } else {
//             console.log("Already linked providers deleted successfully");
//             resolve();
//           }
//         }
//       );
//     });

//     if (!req.body.provider) {
//       res.status(400).send({ error: "no provider selected to link." });
//       return;
//     }

//     const promises = [];
//     if (req.body.provider.length == 1) {
//       const promise = new Promise((resolve, reject) => {
//         DB.query(
//           "INSERT INTO facilityprovider (FACILITYID, PROVIDERID, CREATEDBY) VALUES (?, ?, ?)",
//           [req.params.id, req.body.provider, "Mubasher"],
//           function (err, result, fields) {
//             if (err) reject(err);
//             else resolve();
//           }
//         );
//       });
//       promises.push(promise);
//     } else if (req.body.provider.length > 1) {
//       req.body.provider.forEach((element) => {
//         const promise = new Promise((resolve, reject) => {
//           DB.query(
//             "INSERT INTO facilityprovider (FACILITYID, PROVIDERID, CREATEDBY) VALUES (?, ?, ?)",
//             [req.params.id, element, "Mubasher"],
//             function (err, result, fields) {
//               if (err) reject(err);
//               else resolve();
//             }
//           );
//         });
//         promises.push(promise);
//       });
//     }

//     await Promise.all(promises);
//     console.log("Providers linking updated successfully");
//     res.status(204).send();
//   } catch (err) {
//     console.log("Error in linking providers update to this facility.");
//     console.log(err);
//     res.status(500).send({ error: "internal server error" });
//   }
// });

// // get information of a facility
// router.get("/get/:id", async (req, res) => {
//   const { id } = req.params;

//   const facility = await new Promise((resolve) => {
//     DB.query(
//       `SELECT
//         F.ID, F.FACILITYNAME, F.FACILITYTYPE AS FACILITYTYPEID, FT.FACILITYTYPE, F.ADDRESS, F.CITY, F.SPAINSTATE AS SPAINSTATEID, SS.SPAINSTATE, F.STATEORPROVINCE, F.COUNTRY AS COUNTRYID, C.NAME AS COUNTRY, F.ZIPCODE, F.PHONE, F.FAX, F.EMAILADDRESS, F.REGISTRATIONNO,

//         SA.SHIPTOCONTACT,
//         SA.FACILITYNAME AS SA_FACILITYNAME,
//         SA.ADDRESS AS SA_ADDRESS,
//         SA.CITY AS SA_CITY,
//         SA.SPAINSTATE AS SA_SPAINSTATEID,
//         SS2.SPAINSTATE AS SA_SPAINSTATE,
//         SA.STATEORPROVINCE AS SS_STATEORPROVINCE,
//         SA.COUNTRY AS SA_COUNTRYID,
//         C2.NAME AS SA_COUNTRY,
//         SA.ZIPCODE AS SA_ZIPCODE,
//         SA.PHONE AS SA_PHONE,
//         SA.FAX AS SA_FAX,
//         SA.EMAILADDRESS AS SA_EMAILADDRESS

//       FROM
//         facility F
//         INNER JOIN facilitytype FT ON F.FACILITYTYPE = FT.ID
//         INNER JOIN spainstate SS ON F.SPAINSTATE = SS.ID
//         INNER JOIN country C ON F.COUNTRY = C.ID
//         INNER JOIN facilityshippingaddress SA ON F.ID = SA.ID
//         INNER JOIN country C2 ON SA.COUNTRY = C2.ID
//         INNER JOIN spainstate SS2 ON SA.SPAINSTATE = SS2.ID
//       WHERE F.ID = ?`,
//       [id],
//       (err, rows) => {
//         if (err || rows.length !== 1) console.error(err, rows);
//         resolve(err ? [] : rows[0]);
//       }
//     );
//   });

//   res.send(facility);
// });

// // contrary to the name, it doesn't edit DB values, instead it provides data from the DB to populate the edit form fields
// router.get("/edit/:id", async (req, res, next) => {
//   const { id } = req.params;

//   if (req.session.facilityTypes == undefined || req.session.facilityTypes.length <= 0) {
//     await new Promise((resolve) => {
//       DB.query("SELECT * from facilitytype", function (err, rows) {
//         req.session.facilityTypes = err ? [] : rows;
//         if (err) console.error(err);
//         resolve();
//       });
//     });
//   }

//   if (req.session.spainStates == undefined || req.session.spainStates.length <= 0) {
//     await new Promise((resolve) => {
//       DB.query("SELECT * from spainstate", function (err, rows) {
//         req.session.spainStates = err ? [] : rows;
//         if (err) console.error(err);
//         resolve();
//       });
//     });
//   }

//   if (req.session.countries == undefined || req.session.countries.length <= 0) {
//     await new Promise((resolve) => {
//       DB.query("SELECT * from country", function (err, rows) {
//         req.session.countries = err ? [] : rows;
//         if (err) console.error(err);
//         resolve();
//       });
//     });
//   }

//   const facility = await new Promise((resolve) => {
//     DB.query(
//       `SELECT
//         F.ID, F.FACILITYNAME, F.FACILITYTYPE AS FACILITYTYPEID, FT.FACILITYTYPE, F.ADDRESS, F.CITY, F.SPAINSTATE AS SPAINSTATEID, SS.SPAINSTATE, F.STATEORPROVINCE, F.COUNTRY AS COUNTRYID, C.NAME AS COUNTRY, F.ZIPCODE, F.PHONE, F.FAX, F.EMAILADDRESS, F.REGISTRATIONNO
//       FROM
//         facility F
//         INNER JOIN facilitytype FT ON F.FACILITYTYPE = FT.ID
//         INNER JOIN spainstate SS ON F.SPAINSTATE = SS.ID
//         INNER JOIN country C ON F.COUNTRY = C.ID
//       WHERE F.ID = ?`,
//       [id],
//       (err, rows) => {
//         if (err || rows.length !== 1) console.error(err, rows);
//         resolve(err ? [] : rows[0]);
//       }
//     );
//   });

//   res.send({
//     countries: req.session.countries,
//     spainStates: req.session.spainStates,
//     facilityTypes: req.session.facilityTypes,
//     facility
//   });
// });

// // updates the data of a facility
// router.post("/update/:id", (req, res) => {
//   const { id } = req.params;
//   DB.query("UPDATE facility SET ? WHERE ID = ?", [req.body, id], (err) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send({ error: "internal server error" });
//     } else {
//       res.status(204).send();
//     }
//   });
// });

// // MARK a facility as deleted in the DB and NOT actually delete the entry from the DB
// router.get("/delete/:id", (req, res) => {
//   const { id } = req.params;
//   DB.query("UPDATE facility SET ISDELETED = 1 WHERE ID = ?", [id], (err) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send();
//     } else {
//       res.status(204).send();
//     }
//   });
// });

// // Mark a facility as active in the DB
// router.get("/active/:id", (req, res) => {
//   const { id } = req.params;
//   DB.query("UPDATE facility SET ISACTIVE = 1 WHERE ID = ?", [id], (err) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send();
//     } else {
//       res.status(204).send();
//     }
//   });
// });

// // Mark a facility as inactive
// router.get("/deactive/:id", (req, res) => {
//   const { id } = req.params;
//   DB.query("UPDATE facility SET ISACTIVE = 0 WHERE ID = ?", [id], (err) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send();
//     } else {
//       res.status(204).send();
//     }
//   });
// });

module.exports = { routes: router };
