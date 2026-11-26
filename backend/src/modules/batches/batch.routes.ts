import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth.ts";
import * as BatchController from "./batch.controller.ts";

/** Rotas montadas em /api/batches. Todas exigem sessão. */
const router: Router = Router();

router.use(requireAuth);

router.get("/", BatchController.list);
router.post("/", BatchController.create);
router.get("/:id", BatchController.getById);
router.delete("/:id", BatchController.remove);
router.patch("/:id/steps/:stepId", BatchController.setStepCompleted);

export default router;
