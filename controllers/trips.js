const Trip = require("../models/Trip");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllTrips = async (req, res) => {
  //res.send("get all Trips");
  const trips = await Trip.find({ commuter: req.user._id }).sort("createdAt");
  res.status(StatusCodes.OK).json({ trips, count: trips.length });
};

const getTrip = async (req, res) => {
  const {
    user: { _id: userId },
    params: { id: tripId },
  } = req;
  const trip = await Trip.findOne({ _id: tripId, commuter: userId });

  if (!trip) {
    throw new NotFoundError(` No trip with id ${tripId}`);
  }
  res.status(StatusCodes.OK).json({ trip });
};

const createTrip = async (req, res) => {
  req.body.commuter = req.user._id;
  try {
    const trip = await Trip.create(req.body);
    console.log(trip);
    res.status(StatusCodes.CREATED).json({ trip });
  } catch (e) {
    console.log(e);
  }
};

const updateTrip = async (req, res) => {
  //res.send("get all Trips");
  // "name":"hyytj saa",
  // "email":"5fdrdger@yswf.com",
  // "password":"563cfe"
  // "name":"bfb cvnbvn",
  //   "email":"ergegr@yswf.com",
  //   "password":"yufg43wer"

  //   {
  //     "name":"Fnu Shree",
  //     "email":"shree@ctd.com",
  //     "password":"shr33@CTD"
  // }

  // {
  //     "name":"Fnu Shree",
  //     "email":"fnushree@ctd.com",
  //     "password":"FNUshr33"
  // }
  //   {
  //   "name": "shree swagger",
  //   "email": "fnushree@swagger.com",
  //   "password": "sw@gg3r"
  // }
  const {
    body: { to, from },
    user: { _id: userId },
    params: { id: tripId },
  } = req;
  console.log("req body", to, from);
  if (!to || !from) {
    throw new BadRequestError("To / From cannot be empty");
  }
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: tripId, commuter: userId },
      { date: req.body.date, to: req.body.to, from: req.body.from },
      { new: true, runValidators: true }
    );

    if (!trip) {
      throw new NotFoundError(` No trip with id ${tripId}`);
    }
    res.status(StatusCodes.OK).json({ trip });
  } catch (e) {
    console.log(e);
  }
};

const deleteTrip = async (req, res) => {
  //res.send("delete Trips");
  const {
    user: { _id: userId },
    params: { id: tripId },
  } = req;
  try {
    const trip = await Trip.findByIdAndRemove({
      _id: tripId,
      createdBy: userId,
    });
    if (!trip) {
      throw new NotFoundError(` No trip with id ${tripId}`);
    }
    res.status(StatusCodes.OK).json({ msg: "The entry was deleted." });
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  getAllTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
};
