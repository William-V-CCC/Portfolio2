"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import "./header.css"; // regular CSS import

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    // Optional: close menu on window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768 && menuOpen) {
                setMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [menuOpen]);

    return (
        <header className="header">
            <h1 className="logo">Portfolio</h1>

            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="menuButton"
                aria-label="Toggle Menu"
            >
                {menuOpen ? <X size={48} /> : <Menu size={48} />}
            </button>

            <nav className={`dropdown ${menuOpen ? "open" : ""}`}>
                <ul className="dropdownMenu">
                    <li>
                        <Link href="/" onClick={() => setMenuOpen(false)}>
                            About Me
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/Projects"
                            onClick={() => setMenuOpen(false)}
                        >
                            All Projects
                        </Link>
                    </li>
                    <li>
                        <p className="Github">
                            {" "}
                            <a
                                href="https://github.com/William-V-CCC/William-V-CCC"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Github
                            </a>
                        </p>
                    </li>
                    <li>
                        <p className="LinkedIn">
                            {" "}
                            <a
                                href="https://www.linkedin.com/in/william-vance-bb1852327"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                LinkedIn
                            </a>
                        </p>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
