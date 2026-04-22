import express from "express";
import asyncWrap from "express-async-wrapper";
import mediaController from "./media.controller.js";
import validator from "../common/config/joiValidation.js";
import { userMediaUpload } from "../common/config/multer.js";
import reorderMediaDto from "./dtos/reorderMediaDtos.js";
import markFitnessDto from "./dtos/markFitnessDtos.js";

const router = express.Router();

router.get("/", asyncWrap(mediaController.list));
router.post("/upload", userMediaUpload.single("file"), asyncWrap(mediaController.upload));
router.put("/reorder", validator.body(reorderMediaDto), asyncWrap(mediaController.reorder));
router.put("/:id/setmain", asyncWrap(mediaController.setMain));
router.put("/:id/markfitness", validator.body(markFitnessDto), asyncWrap(mediaController.markFitness));
router.delete("/:id", asyncWrap(mediaController.remove));

export default router;
