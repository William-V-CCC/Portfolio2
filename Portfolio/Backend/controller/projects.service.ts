// @deno-types="npm:@types/express"
import express from "npm:express";
import { connection } from "../sqlConnector.ts";

// Get all projects or a single project by ID
export function getProject(req: express.Request, res: express.Response) {
  const { id } = req.query;

  let query = `SELECT * FROM Projects`;
  const params: any[] = [];

  if (id) {
    query += ` WHERE ID = ?`;
    params.push(id);
  }

  query += ` ORDER BY ID ASC`;

  connection.query(query, params, (err: any, results: any) => {
    if (err) {
      console.error("Database fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch projects" });
    }

    // Send results back to the client
    res.status(200).json(results);
  });
}

// Add a new project
export function addProject(req: express.Request, res: express.Response) {
  const { Title, Description, StartDate, FinishDate } = req.body;

  if (!Title || !Description || !StartDate || !FinishDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `INSERT INTO Projects (Title, Description, StartDate, FinishDate) VALUES (?, ?, ?, ?)`;
  const values = [Title, Description, StartDate, FinishDate];

  connection.query(sql, values, (err: any, results: any) => {
    if (err) {
      console.error("Database insert error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "Project added successfully", id: results.insertId });
  });
}

// Update an existing project
export function updateProject(req: express.Request, res: express.Response) {
  const { id } = req.params;
  const { Title, Description, StartDate, FinishDate } = req.body;

  const updates: string[] = [];
  const values: any[] = [];

  if (Title !== undefined) {
    updates.push("Title = ?");
    values.push(Title);
  }
  if (Description !== undefined) {
    updates.push("Description = ?");
    values.push(Description);
  }
  if (StartDate !== undefined) {
    updates.push("StartDate = ?");
    values.push(StartDate);
  }
  if (FinishDate !== undefined) {
    updates.push("FinishDate = ?");
    values.push(FinishDate);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  const sql = `UPDATE Projects SET ${updates.join(", ")} WHERE ID = ?`;
  values.push(id);

  connection.query(sql, values, (err: any, results: any) => {
    if (err) {
      console.error("Database update error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({ message: "Project updated successfully", id });
  });
}
