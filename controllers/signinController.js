const request = require("request");

const lockView = (req, res, next) => {
  request(
    {
      url: "http://3.133.20.223:8080/iSupport/getOrganizationRole/",
      method: "POST",
      headers: {
        Authorization: "Bearer " + req.session.accessToken
      },
      json: {
        username: "SUFJAM513",
        password: "test@1234",
        application: "iSupport",
        module: "program management module"
      }
    },
    (err, apiRes, body) => {
      if (!apiRes.body.error) {
        res.render("lock-illustration", { organizations: body });
      } else {
        console.log(apiRes.body.error);
      }
    }
  );
};

module.exports = {
  lockView
};
