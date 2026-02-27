import { Router } from "express";
import * as ctrl from "../controllers/coursesController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course catalog
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: List all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get("/", ctrl.listCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course found
 *       404:
 *         description: Course not found
 */
router.get("/:id", ctrl.getCourse);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               credits:
 *                 type: integer
 *             required: [code, title]
 *     responses:
 *       201:
 *         description: Course created
 *       409:
 *         description: Code already exists
 */
router.post("/", ctrl.createCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
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
 *               code:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               credits:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Course updated
 *       404:
 *         description: Course not found
 */
router.put("/:id", ctrl.updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Soft delete a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Course soft deleted
 *       404:
 *         description: Course not found
 */
router.delete("/:id", ctrl.deleteCourse);

export default router;
