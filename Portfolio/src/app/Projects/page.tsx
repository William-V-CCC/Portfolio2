"use client";
import { useEffect, useState } from "react";
import styles from "./projects.module.css";
import Footer from "../Components/Footer";
type Project = {
    id: number;
    title: string;
    description: string;
    startDate: string;
    finishDate: string;
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const res = await fetch("http://localhost:4050/api/projects");
                if (!res.ok) throw new Error("Failed to fetch projects");

                const data = await res.json();

                const formatted = data.map((item: any) => ({
                    id: item.ID,
                    title: item.Title,
                    description: item.Description,
                    startDate: item.StartDate,
                    finishDate: item.FinishDate,
                }));

                setProjects(formatted);
            } catch (err) {
                console.error("Error fetching projects:", err);
                setProjects([]);
            }
        }

        fetchProjects();
    }, []);

    return (
        <div className={styles.app}>
            <div className={styles.projectBox}>
                {/* Contact links at the top middle */}
                <div className={styles.contactLinks}>
                    Contact For Links
                </div>

                {/* Projects grid */}
                <div className={styles.projects}>
                    {projects.length > 0
                        ? projects.map((proj) => (
                            <div key={proj.id} className={styles.textBox}>
                                <h3>{proj.title}</h3>
                                <p>{proj.description}</p>
                                <p className={styles.caption}>
                                    <strong>Start:</strong>{" "}
                                    {proj.startDate.split("T")[0]}
                                    <br />
                                    <strong>Finish:</strong>{" "}
                                    {proj.finishDate.split("T")[0]}
                                </p>
                            </div>
                        ))
                        : <p className={styles.noProj}>No projects found.</p>}
                </div>
            </div>
        </div>
    );
}
