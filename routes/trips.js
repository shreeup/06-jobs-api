const express = require("express");

const router = express.Router();

const {
  getAllTrips,
  getTrip,
  createTrip,
  deleteTrip,
  updateTrip,
} = require("../controllers/trips");

router.route("/").post(createTrip).get(getAllTrips);
router.route("/:id").get(getTrip).delete(deleteTrip).patch(updateTrip);

module.exports = router;
