// deno-lint-ignore-file no-explicit-any ban-types
import { Request, Response } from 'express';
import { query } from '../db.ts';
import { CreateProjectDTO, UpdateProjectDTO } from '../dtos/project.dto.ts';
import fs from 'node:fs';
import path from 'node:path';
import process from "node:process";

// ------------------ AUTH MIDDLEWARE ------------------
export function authMiddleware(req: Request, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${process.env.API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ------------------ GET ROUTES (no auth) ------------------
export async function getProjectById(req: Request, res: Response) {
  const { id } = req.params;
  console.log("GET /api/projects/:id called with:", id);
  try {
    const result = await query('SELECT * FROM projects WHERE id = $1', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Project not found' });

    const project = result.rows[0];

    if (!Array.isArray(project.images)) {
      if (typeof project.images === 'string') {
        project.images = project.images.replace(/^{|}$/g, '').split(',');
      } else {
        project.images = [];
      }
    }

    res.json(project);
  } catch (err) {
    console.error("Postgres error:", err);
    res.status(500).json({ error: 'Failed to fetch project', details: err });
  }
}

export async function getProjects(_req: Request, res: Response) {
  try {
    const result = await query('SELECT * FROM projects ORDER BY created_at DESC');

    const projects = result.rows.map((proj) => {
      if (!Array.isArray(proj.images)) {
        if (typeof proj.images === 'string') {
          proj.images = proj.images.replace(/^{|}$/g, '').split(',');
        } else {
          proj.images = [];
        }
      }
      return proj;
    });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects', details: err });
  }
}

// ------------------ CREATE / UPDATE ------------------
export async function createProject(req: Request, res: Response) {
  try {
    const images = (req.files as Express.Multer.File[] || []).map(f => `/uploads/${f.filename}`);
    const body: CreateProjectDTO = { ...req.body, images };
    const start_date = body.start_date ? new Date(body.start_date).toISOString().split('T')[0] : null;
    const finish_date = body.finish_date ? new Date(body.finish_date).toISOString().split('T')[0] : null;

    const result = await query(
      `INSERT INTO projects (title, description, start_date, finish_date, images)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [body.title, body.description, start_date, finish_date, body.images || []]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project', details: err });
  }
}

export async function updateProject(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const files = (req.files as Express.Multer.File[] || []);
    const images = files.map(f => `/uploads/${f.filename}`);
    const body: UpdateProjectDTO = { ...req.body };
    if (images.length) body.images = images;

    if (body.start_date) body.start_date = new Date(body.start_date).toISOString().split('T')[0];
    if (body.finish_date) body.finish_date = new Date(body.finish_date).toISOString().split('T')[0];

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(body)) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }

    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

    values.push(id);
    const result = await query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (!result.rows.length) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project', details: err });
  }
}

// ------------------ DELETE PROJECT ------------------
export async function deleteProject(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const projectResult = await query('SELECT * FROM projects WHERE id = $1', [id]);
    if (!projectResult.rows.length) return res.status(404).json({ error: 'Project not found' });

    const project = projectResult.rows[0];
    let images: string[] = [];
    if (Array.isArray(project.images)) images = project.images;
    else if (typeof project.images === 'string') images = project.images.replace(/^{|}$/g, '').split(',');

    // Delete files from /uploads
    for (const imgPath of images) {
      try {
        const filePath = imgPath.startsWith('/')
          ? path.join(__dirname, '..', imgPath)
          : path.join(__dirname, '..', 'uploads', imgPath);

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete file ${imgPath}:`, err);
      }
    }

    const deleteResult = await query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    if (!deleteResult.rows.length) return res.status(404).json({ error: 'Project not found' });

    res.json({ message: 'Project deleted successfully', project: deleteResult.rows[0] });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Failed to delete project', details: err });
  }
}