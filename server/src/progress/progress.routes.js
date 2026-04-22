import express from "express";
import asyncWrap from "express-async-wrapper";
import progressController from "./progress.controller.js";
import validator from "../common/config/joiValidation.js";
import { progressUpload } from "../common/config/multer.js";
import uploadProgressDto from "./dtos/uploadProgressDtos.js";

const router = express.Router();

router.get("/me", asyncWrap(progressController.listMine));
router.post("/upload", progressUpload.single("file"), validator.body(uploadProgressDto), asyncWrap(progressController.upload));
router.get("/badgestatus", asyncWrap(progressController.badgeStatus));
router.get("/badge-status", asyncWrap(progressController.badgeStatus));
router.get("/user/:userId", asyncWrap(progressController.listByUser));
router.delete("/:id", asyncWrap(progressController.remove));

export default router;
