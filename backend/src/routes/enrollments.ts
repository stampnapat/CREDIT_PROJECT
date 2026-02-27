import { Router } from "express";
import * as ctrl from "../controllers/enrollmentsController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: User course enrollments
 */

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Enroll a user in a course
 *     tags: [Enrollments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               courseId:
 *                 type: integer
 *             required:
 *               - userId
 *               - courseId
 *     responses:
 *       201:
 *         description: Enrollment created
 *       400:
 *         description: Missing userId or courseId
 *       500:
 *         description: Server error
 */
router.post("/", ctrl.createEnrollment);

/**
 * @swagger
 * /api/enrollments/user/{userId}:
 *   get:
 *     summary: List enrollments for a user
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of enrollments
 */
router.get("/user/:userId", ctrl.listByUser);

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: List all enrollments
 *     tags: [Enrollments]
 *     responses:
 *       200:
 *         description: List of all enrollments
 */
router.get("/", ctrl.listAll);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   put:
 *     summary: Update an enrollment (status, grade, creditsEarned)
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [NOT_STARTED, IN_PROGRESS, COMPLETED]
 *               grade:
 *                 type: string
 *               creditsEarned:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Enrollment updated
 *       404:
 *         description: Not found
 */
router.put("/:id", ctrl.updateEnrollment);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   delete:
 *     summary: Soft delete an enrollment
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Enrollment soft deleted
 *       404:
 *         description: Not found
 */
router.delete("/:id", ctrl.deleteEnrollment);

export default router;
