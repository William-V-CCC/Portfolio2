"use client";
import { useEffect, useState } from "react";
import styles from "./projects.module.css";
import Footer from "../Components/Footer";

type Project = {
    id: string;
    title: string;
    description: string;
    startDate?: string;
    finishDate?: string;
    images?: string[];
};

// ✅ use env with proper fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL ||
    "https://api.williamvance.app";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalIndex, setModalIndex] = useState(0);
    const [modalImages, setModalImages] = useState<string[]>([]);

    useEffect(() => {
        async function fetchProjects() {
            try {
                // ✅ FIXED: removed localhost + removed /api
                const res = await fetch(`${API_URL}/projects`);
                if (!res.ok) throw new Error("Failed to fetch projects");

                const data = await res.json();

                const formatted: Project[] = data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    startDate: item.start_date ?? "",
                    finishDate: item.finish_date ?? "",
                    images: Array.isArray(item.images)
                        ? item.images.map((img: string) =>
                            img.startsWith("http") ? img : `${API_URL}${img}` // ✅ FIXED image URL
                        )
                        : [],
                }));

                setProjects(formatted);
            } catch (err) {
                console.error("Error fetching projects:", err);
                setProjects([]);
            }
        }

        fetchProjects();
    }, []);

    const openModal = (images: string[], index: number) => {
        setModalImages(images);
        setModalIndex(index);
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const prevImage = () =>
        setModalIndex((prev) => prev === 0 ? modalImages.length - 1 : prev - 1);

    const nextImage = () =>
        setModalIndex((prev) => (prev + 1) % modalImages.length);

    return (
        <div className={styles.app}>
            <div className={styles.contentWrapper}>
                <div className={styles.projectBox}>
                    <div className={styles.contactLinks}>Contact For Links</div>

                    <div className={styles.projects}>
                        {projects.length > 0
                            ? (
                                projects.map((proj) => (
                                    <div
                                        key={proj.id}
                                        className={styles.featuredTextBox}
                                    >
                                        <div
                                            className={styles
                                                .projectCardContent}
                                        >
                                            <div
                                                className={styles
                                                    .projectImageWrapper}
                                            >
                                                {proj.images &&
                                                        proj.images.length > 0
                                                    ? (
                                                        <>
                                                            {proj.images
                                                                        .length >
                                                                    1 && (
                                                                <button
                                                                    className={styles
                                                                        .arrowLeft}
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        setModalIndex(
                                                                            (
                                                                                prev,
                                                                            ) => prev ===
                                                                                    0
                                                                                ? proj
                                                                                    .images!
                                                                                    .length -
                                                                                    1
                                                                                : prev -
                                                                                    1,
                                                                        );
                                                                    }}
                                                                >
                                                                    &#10094;
                                                                </button>
                                                            )}

                                                            <img
                                                                src={proj
                                                                    .images[0]}
                                                                alt={proj.title}
                                                                className={styles
                                                                    .projectImageFull}
                                                                onClick={() =>
                                                                    openModal(
                                                                        proj.images!,
                                                                        0,
                                                                    )}
                                                            />

                                                            {proj.images
                                                                        .length >
                                                                    1 && (
                                                                <button
                                                                    className={styles
                                                                        .arrowRight}
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        setModalIndex(
                                                                            (
                                                                                prev,
                                                                            ) => (prev +
                                                                                1) %
                                                                                proj.images!
                                                                                    .length,
                                                                        );
                                                                    }}
                                                                >
                                                                    &#10095;
                                                                </button>
                                                            )}
                                                        </>
                                                    )
                                                    : (
                                                        <div
                                                            className={styles
                                                                .imagePlaceholder}
                                                        >
                                                            No Image
                                                        </div>
                                                    )}
                                            </div>

                                            <div className={styles.projectInfo}>
                                                <h3>{proj.title}</h3>
                                                <p>{proj.description}</p>
                                                <p className={styles.caption}>
                                                    {proj.startDate && (
                                                        <>
                                                            <strong>
                                                                Start:
                                                            </strong>{" "}
                                                            {proj.startDate
                                                                .split("T")[0]}
                                                            <br />
                                                        </>
                                                    )}
                                                    {proj.finishDate && (
                                                        <>
                                                            <strong>
                                                                Finish:
                                                            </strong>{" "}
                                                            {proj.finishDate
                                                                .split("T")[0]}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )
                            : (
                                <p className={styles.noProj}>
                                    No projects found.
                                </p>
                            )}
                    </div>
                </div>

                {modalOpen && (
                    <div className={styles.modalOverlay} onClick={closeModal}>
                        <div
                            className={styles.modalContent}
                            onClick={(e) =>
                                e.stopPropagation()}
                        >
                            <div className={styles.modalImageWrapper}>
                                <img
                                    src={modalImages[modalIndex]}
                                    alt="Project"
                                    className={styles.modalImage}
                                />
                                {modalImages.length > 1 && (
                                    <>
                                        <button
                                            className={styles.modalArrowLeft}
                                            onClick={prevImage}
                                        >
                                            &#10094;
                                        </button>
                                        <button
                                            className={styles.modalArrowRight}
                                            onClick={nextImage}
                                        >
                                            &#10095;
                                        </button>
                                    </>
                                )}
                                <button
                                    className={styles.modalClose}
                                    onClick={closeModal}
                                >
                                    &times;
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
