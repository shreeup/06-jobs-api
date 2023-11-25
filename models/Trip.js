const mongoose = require("mongoose");
const TripSchema = new mongoose.Schema(
  {
    Date: {
      type: Date,
      required: [true, "Please provide trip date"],
    },
    From: {
      type: String,
      required: [true, "Please provide pickup point"],
      maxlength: 50,
    },
    To: {
      type: String,
      required: [true, "Please provide drop point"],
      maxlength: 50,
    },
    commuter: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", TripSchema);
