// deno-lint-ignore-file no-explicit-any
import { Request, Response } from 'express';
import { query } from '../db.ts';
import { CreateProjectDTO, UpdateProjectDTO } from '../dtos/project.dto.ts';

export async function getProjectById(req: Request, res: Response) {
  const { id } = req.params;
  console.log("GET /api/projects/:id called with:", id);
  try {
    const result = await query('SELECT * FROM projects WHERE id = $1', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Project not found' });

    const project = result.rows[0];

    // normalize images to always be a JS array
    if (!Array.isArray(project.images)) {
      if (typeof project.images === 'string') {
        // convert Postgres array string "{/img1,/img2}" => ["/img1", "/img2"]
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
      // normalize images array
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

export async function createProject(req: Request, res: Response) {
  try {
    // Map uploaded files to array of URLs or paths
    const images = (req.files as Express.Multer.File[] || []).map(f => `/uploads/${f.filename}`);

    // Normalize dates to YYYY-MM-DD for Postgres
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

    // Handle uploaded files
    const files = (req.files as Express.Multer.File[] || []);
    const images = files.map(f => `/uploads/${f.filename}`);

    const body: UpdateProjectDTO = { ...req.body };
    if (images.length) body.images = images;

    // Normalize dates if provided
    if (body.start_date) body.start_date = new Date(body.start_date).toISOString().split('T')[0];
    if (body.finish_date) body.finish_date = new Date(body.finish_date).toISOString().split('T')[0];

    // Build dynamic SQL
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(body)) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }

    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

    values.push(id); // WHERE clause
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

export async function deleteProject(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project', details: err });
  }
}