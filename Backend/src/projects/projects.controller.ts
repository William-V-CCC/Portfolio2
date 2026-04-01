import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UploadedFiles, UseGuards, UseInterceptors,
  HttpException, HttpStatus,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDTO, UpdateProjectDTO } from './dtos/project.dto';
import { AuthGuard } from '../guards/auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ------------------- GET ALL -------------------
  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'List of projects returned' })
  async getProjects() {
    try {
      return await this.projectsService.findAll();
    } catch (err) {
      throw new HttpException(
        { message: 'Failed', details: err },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ------------------- GET ONE -------------------
  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project found' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProjectById(@Param('id') id: string) {
    const proj = await this.projectsService.findOne(id);
    if (!proj)
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    return proj;
  }

  // ------------------- CREATE -------------------
  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project (with images upload)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Project data + images',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        start_date: { type: 'string', format: 'date' },
        finish_date: { type: 'string', format: 'date' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' }, // 🔥 THIS CREATES FILE INPUTS
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'images', maxCount: 10 }],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (_req, file, cb) =>
            cb(
              null,
              `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(
                file.originalname
              )}`
            ),
        }),
      }
    )
  )
  async createProject(
    @Body() dto: CreateProjectDTO,
    @UploadedFiles() files: { images?: Express.Multer.File[] }
  ) {
    const images =
      files?.images?.map((f) => `/uploads/${f.filename}`) || [];
    return this.projectsService.create({ ...dto, images });
  }

  // ------------------- UPDATE -------------------
  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project (optional image upload)' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Updated project data + optional images',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        start_date: { type: 'string', format: 'date' },
        finish_date: { type: 'string', format: 'date' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'images', maxCount: 10 }],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (_req, file, cb) =>
            cb(
              null,
              `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(
                file.originalname
              )}`
            ),
        }),
      }
    )
  )
  async updateProject(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDTO,
    @UploadedFiles() files: { images?: Express.Multer.File[] }
  ) {
    const images = files?.images?.map((f) => `/uploads/${f.filename}`);
    if (images?.length) dto.images = images;

    const updated = await this.projectsService.update(id, dto);
    if (!updated)
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);

    return updated;
  }

  // ------------------- DELETE -------------------
  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project deleted' })
  async deleteProject(@Param('id') id: string) {
    const deleted = await this.projectsService.remove(id);
    if (!deleted)
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);

    return {
      message: 'Project deleted successfully',
      project: deleted,
    };
  }
}