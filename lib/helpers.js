function payloadChecker(req, res, next) {
  const badKeys = [];
  for (const [key, value] of Object.entries(req.body)) {
    if (value === null) badKeys.push([key, "a null"]);
    else if (value === "") badKeys.push([key, "an empty string"]);
  }

  if (badKeys.length > 0) {
    res.status(400).send({
      status: "error",
      error: `Bad payload:\n${badKeys
        .map((info) => `  Provided key "${info[0]}" has ${info[1]} value`)
        .join("\n")}`
    });
  } else {
    next();
  }
}

module.exports = { payloadChecker };
