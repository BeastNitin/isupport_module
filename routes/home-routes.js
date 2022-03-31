const express = require("express");

const {
  newcaseintakeView,
  newProviderView,
  allcaseintakeView,
  allProvidersView,
  newProductView,
  allProductsView,
  newProgramView,
  allProgramsView,
  allShippingView
} = require("../controllers/homeController");
const router = express.Router();

router.get("/caseintakeView", newcaseintakeView);
router.get("/allcaseintakeView", allcaseintakeView);

router.get("/allShippingView", allShippingView);

router.get("/newprovider", newProviderView);
router.get("/allProvidersView", allProvidersView);

router.get("/newproduct", newProductView);
router.get("/allProductsView", allProductsView);

router.get("/newprogram", newProgramView);
router.get("/allProgramsView", allProgramsView);

module.exports = { routes: router };
