import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateProjectDTO, UpdateProjectDTO } from './dtos/project.dto';
import fs from 'fs';
import path from 'path';

@Injectable()
export class ProjectsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query('SELECT * FROM projects ORDER BY created_at DESC');
    return result.rows.map(proj => ({
      ...proj,
      images: typeof proj.images === 'string' ? proj.images.replace(/^{|}$/g, '').split(',') : proj.images || [],
    }));
  }

  async findOne(id: string) {
    const result = await this.db.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (!result.rows.length) return null;
    const project = result.rows[0];
    project.images = typeof project.images === 'string' ? project.images.replace(/^{|}$/g, '').split(',') : project.images || [];
    return project;
  }

  async create(dto: CreateProjectDTO) {
    const start_date = dto.start_date ? new Date(dto.start_date).toISOString().split('T')[0] : null;
    const finish_date = dto.finish_date ? new Date(dto.finish_date).toISOString().split('T')[0] : null;

    const result = await this.db.query(
      `INSERT INTO projects (title, description, start_date, finish_date, images)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [dto.title, dto.description, start_date, finish_date, dto.images || []]
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateProjectDTO) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(dto)) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
    if (!fields.length) return null;
    values.push(id);

    const result = await this.db.query(`UPDATE projects SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    if (!result.rows.length) return null;
    return result.rows[0];
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    if (!project) return null;

    // Delete images from uploads
    for (const img of project.images || []) {
      try {
        const filePath = path.join(process.cwd(), img.replace(/^\//, ''));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete file ${img}:`, err);
      }
    }

    const result = await this.db.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}