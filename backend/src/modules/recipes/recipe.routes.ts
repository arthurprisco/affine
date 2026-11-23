import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth.ts";
import * as RecipeController from "./recipe.controller.ts";

/** Rotas montadas em /api/recipes. Todas exigem sessão. */
const router: Router = Router();

router.use(requireAuth);

router.get("/", RecipeController.list);
router.post("/", RecipeController.create);
router.get("/:id", RecipeController.getById);
router.put("/:id", RecipeController.update);
router.delete("/:id", RecipeController.remove);
router.patch("/:id/archive", RecipeController.archive);
router.patch("/:id/unarchive", RecipeController.unarchive);

export default router;
