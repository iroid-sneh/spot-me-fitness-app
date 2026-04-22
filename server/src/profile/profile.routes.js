import express from "express";
import asyncWrap from "express-async-wrapper";
import profileController from "./profile.controller.js";
import validator from "../common/config/joiValidation.js";
import setupCompleteDto from "./dtos/setupCompleteDtos.js";
import editProfileDto from "./dtos/editProfileDtos.js";
import editFitnessDto from "./dtos/editFitnessDtos.js";
import editLifestyleDto from "./dtos/editLifestyleDtos.js";
import updateLocationDto from "./dtos/updateLocationDtos.js";

const router = express.Router();

router.post("/setupcomplete", validator.body(setupCompleteDto), asyncWrap(profileController.setupComplete));
router.get("/me", asyncWrap(profileController.myProfile));
router.put("/me", validator.body(editProfileDto), asyncWrap(profileController.editProfile));
router.put("/fitness", validator.body(editFitnessDto), asyncWrap(profileController.editFitness));
router.put("/lifestyle", validator.body(editLifestyleDto), asyncWrap(profileController.editLifestyle));
router.put("/location", validator.body(updateLocationDto), asyncWrap(profileController.updateLocation));
router.get("/:userId", asyncWrap(profileController.getById));

export default router;
