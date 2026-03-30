// @deno-types="npm:@types/express"
import { Router } from "npm:express"
import { getProject, addProject, updateProject } from "./projects.service.ts"

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: API for managing portfolio projects
 */
const projectsRouter = Router()

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects or a single project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Optional project ID
 *     responses:
 *       200:
 *         description: List of projects or a single project
 *       404:
 *         description: Project not found (if ID provided)
 *       500:
 *         description: Server error
 */
projectsRouter.get("/", getProject)

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Title
 *               - Description
 *               - StartDate
 *               - FinishDate
 *             properties:
 *               Title:
 *                 type: string
 *               Description:
 *                 type: string
 *               StartDate:
 *                 type: string
 *                 format: date
 *               FinishDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
projectsRouter.post("/", addProject)

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     summary: Update an existing project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *               Description:
 *                 type: string
 *               StartDate:
 *                 type: string
 *                 format: date
 *               FinishDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: No fields provided to update
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
projectsRouter.patch("/:id", updateProject)

export default projectsRouter
