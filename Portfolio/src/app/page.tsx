"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import ProjectsPage from "./Projects/page";

type Project = {
  id: number;
  title: string;
  description: string;
  startDate: string;
  finishDate: string;
};

// global variable for featured IDs
const FEATURED_PROJECT_IDS = [28, 29, 5];

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchFeaturedProjects() {
      try {
        const projects: Project[] = [];

        for (const id of FEATURED_PROJECT_IDS) {
          const res = await fetch(
            `http://localhost:4050/api/projects?id=${id}`,
          );
          if (!res.ok) continue; // skip if project not found
          const data = await res.json();

          // map DB fields to frontend-friendly
          const formatted = Array.isArray(data)
            ? data.map((item: any) => ({
              id: item.ID,
              title: item.Title,
              description: item.Description,
              startDate: item.StartDate,
              finishDate: item.FinishDate,
            }))
            : [{
              id: data.ID,
              title: data.Title,
              description: data.Description,
              startDate: data.StartDate,
              finishDate: data.FinishDate,
            }];

          projects.push(...formatted);
        }

        setFeaturedProjects(projects);
      } catch (err) {
        console.error("Error fetching featured projects:", err);
        setFeaturedProjects([]);
      }
    }

    fetchFeaturedProjects();
  }, []);

  return (
    <div className={styles.app}>
      {/* Your existing header/profile/content */}
      <div className={styles.profile}>
        <div className={styles.avatar}></div>
        <p>William Vance</p>
      </div>

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>About Me -</h2>
        <div className={styles.textBox}>
          <p>
            Aspiring software Developer, currently enrolled at Fort Hays State |
            Tech . In Goodland
          </p>
          <br />
          <div>
            Javascript, Typescript, HTML, CSS, Docker, Github, Firebase, MongoDB
          </div>
        </div>
      </div>

      <div className={styles.ExperiencePage}>
        {/* Experience component */}
      </div>

      {/* Featured Projects Section */}
      <div className={styles.projectBox}>
        <h2 className={styles.featuredSectionTitle}>Current Projects</h2>
        <div className={styles.featuredProjects}>
          {featuredProjects.length > 0
            ? featuredProjects.map((proj) => (
              <div key={proj.id} className={styles.featuredTextBox}>
                <h3>{proj.title}</h3>
                <p>{proj.description}</p>
                <p className={styles.featuredCaption}>
                  <strong>Start:</strong> {proj.startDate.split("T")[0]}
                  <br />
                  <strong>Finish:</strong> {proj.finishDate.split("T")[0]}
                </p>
              </div>
            ))
            : <p className={styles.noProj}>No current projects found.</p>}
        </div>
      </div>
    </div>
  );
}
