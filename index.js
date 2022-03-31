require("dotenv").config({ path: `${__dirname}/../.env` });

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const flash = require("express-flash");
const db = require("/Users/nitin/Desktop/isupport_mod/iSupport-Backend/src/lib/db");

const homeRoutes = require("./routes/home-routes");
const signinRoutes = require("./routes/signin-routes");
const caseintakeCrud = require("./cruds/caseIntake-crud");
const shippingCrud = require("./cruds/shipping-crud");
const providerCrud = require("./cruds/provider-crud");
const productCrud = require("./cruds/product-crud");
const programCrud = require("./cruds/program-crud");
const dbRoutes = require("./routes/dropdowns");

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({ secret: "mySecretKey", resave: true }));
app.use(flash());
app.use(express.urlencoded({ extended: false }));

app.use(homeRoutes.routes);
app.use(signinRoutes.routes);
app.use("/caseintake", caseintakeCrud.routes);
app.use("/provider", providerCrud.routes);
app.use("/shipping", shippingCrud.routes);
app.use("/product", productCrud.routes);
app.use("/program", programCrud.routes);
app.use(dbRoutes.routes);

// app.post("/post_case_intake_initiate", (req, res) => {
//     console.log("req.body", req.body);
//     let sql = `insert into case_intake_initiate (general_awareness_date,general_processing_center_recieved_date,general_Primary_source_country,general_report_type,general_case_significance,general_adverse_event_type,general_reference_no,program_id,program_name,patient_id,patient_intials,patient_gender,patient_dob,patient_age,patient_age_unit,patient_age_group,Reporter_first_name,Reporter_last_name,Reporter_organisation_name,Reporter_country,Reporter_report_type,product_name,product_generic_name,event_adverse_event,event_onset_date,event_case_serious,event_outcome,event_country_of_occurence) values ("${req.body.general_awareness_date}","${req.body.general_processing_center_recieved_date}","${req.body.general_Primary_source_country}","${req.body.general_report_type}","${req.body.general_case_significance}","${req.body.general_adverse_event_type}","${req.body.general_reference_no}","${req.body.program_id}","${req.body.program_name}","${req.body.patient_id}","${req.body.patient_intials}","${req.body.patient_gender}","${req.body.patient_dob}","${req.body.patient_age}","${req.body.patient_age_unit}","${req.body.patient_age_group}","${req.body.Reporter_first_name}","${req.body.Reporter_last_name}","${req.body.Reporter_organisation_name}","${req.body.Reporter_country}","${req.body.Reporter_report_type}","${req.body.product_name}","${req.body.product_generic_name}","${req.body.event_adverse_event}","${req.body.event_onset_date}","${req.body.event_case_serious}","${req.body.event_outcome}","${req.body.event_country_of_occurence}")`;
//     db.query(sql, (err, result) => {
//       if (err) {
//         console.log("error", err);
//         return res.status(500);
//       } else {
//         console.log("initiated");
//         return res.json(result);
//       }
//     });
//     console.log(sql);
//   });

  app.get("/get_case_intake_initiate", (req, res) => {
    let sql = `SELECT * FROM case_intake_initiate`;
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
  
        return res.status(500);
      }
      return res.json(result);
    });
  });

const port = parseInt(process.env.PORT);
app.listen(port, () => console.info(`[Server] > Listening on port ${port}`));
