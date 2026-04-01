"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

type Project = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  finishDate: string;
  images: string[];
};

// Backend response type
type ProjectResponse = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  finish_date: string;
  images: string[];
};

const FEATURED_PROJECT_IDS = [
  "344db24f-2b59-474d-9263-9db9bb9d6efd", // Add the UUID here later
];

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchFeaturedProjects() {
      try {
        const projects = await Promise.all(
          FEATURED_PROJECT_IDS.map(async (id) => {
            try {
              const res = await fetch(
                `http://localhost:3050/api/projects/${id}`,
              );
              if (!res.ok) throw new Error(`Failed to fetch project ${id}`);
              const data: ProjectResponse = await res.json();
              const imagesArray = Array.isArray(data.images) ? data.images : [];
              return {
                id: data.id,
                title: data.title,
                description: data.description,
                startDate: data.start_date,
                finishDate: data.finish_date,
                images: imagesArray.map((img) => `http://localhost:3050${img}`),
              } as Project;
            } catch (err) {
              console.error(`Error fetching project ${id}:`, err);
              return undefined; // safely filter out later
            }
          }),
        );

        // Filter out projects without valid id
        setFeaturedProjects(
          projects.filter((p): p is Project => !!p && !!p.id),
        );
      } catch (err) {
        console.error("Unexpected error fetching projects:", err);
        setFeaturedProjects([]);
      }
    }

    fetchFeaturedProjects();
  }, []);

  return (
    <div className={styles.app}>
      <div className={styles.profile}>
        <div className={styles.avatar}>
          <Image src="/WilliamV.png" alt="My Image" width={120} height={120} />
        </div>
        <p>William Vance</p>
      </div>

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>About Me -</h2>
        <div className={styles.textBox}>
          <p>
            Aspiring software Developer, currently enrolled at Fort Hays State |
            Tech. In Goodland KS
          </p>
          <br />
          <div>
            <h4>Languages I Know / Am Proficient In -</h4>
            Javascript, Typescript, HTML, CSS, Docker, Github, Firebase,
            MongoDB, Vercel, Deno, React, NextJS, NestJS
          </div>
        </div>
      </div>

      <div className={styles.ExperiencePage}></div>

      <div className={styles.projectBox}>
        <h2 className={styles.featuredSectionTitle}>Current Projects</h2>
        <div className={styles.featuredProjects}>
          {featuredProjects.length > 0
            ? featuredProjects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))
            : <p className={styles.noProj}>No current projects found.</p>}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImgIndex, setModalImgIndex] = useState(0);

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setImgIndex((prev) => (prev === 0 ? project.images.length - 1 : prev - 1));
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setImgIndex((prev) => (prev + 1) % project.images.length);
  };

  const openModal = (index: number) => {
    setModalImgIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const modalPrev = () => {
    setModalImgIndex((
      prev,
    ) => (prev === 0 ? project.images.length - 1 : prev - 1));
  };

  const modalNext = () => {
    setModalImgIndex((prev) => (prev + 1) % project.images.length);
  };

  return (
    <>
      <div className={styles.featuredTextBox}>
        <div className={styles.projectCardContent}>
          {/* Image Section */}
          <div className={styles.projectImageWrapper}>
            {project.images.length > 0
              ? (
                <>
                  {project.images.length > 1 && (
                    <button className={styles.arrowLeft} onClick={prevImage}>
                      &#10094;
                    </button>
                  )}
                  <Image
                    src={project.images[imgIndex]}
                    alt={project.title}
                    width={400}
                    height={250}
                    className={styles.projectImageFull}
                    onClick={() => openModal(imgIndex)}
                  />
                  {project.images.length > 1 && (
                    <button className={styles.arrowRight} onClick={nextImage}>
                      &#10095;
                    </button>
                  )}
                </>
              )
              : <div className={styles.imagePlaceholder}>No Image</div>}
          </div>

          {/* Info Section */}
          <div className={styles.projectInfo}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <p className={styles.projectDates}>
              <strong>Start:</strong> {project.startDate.split("T")[0]}
              <br />
              <strong>Finish:</strong> {project.finishDate.split("T")[0]}
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {project.images.length > 1 && (
              <button className={styles.modalArrowLeft} onClick={modalPrev}>
                &#10094;
              </button>
            )}
            <Image
              src={project.images[modalImgIndex]}
              alt={project.title}
              width={600}
              height={400}
              className={styles.modalImage}
            />
            {project.images.length > 1 && (
              <button className={styles.modalArrowRight} onClick={modalNext}>
                &#10095;
              </button>
            )}
            <button className={styles.modalClose} onClick={closeModal}>
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
