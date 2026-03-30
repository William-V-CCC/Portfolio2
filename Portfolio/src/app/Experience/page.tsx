import styles from "./experience.module.css";
export default function ExperiencePage() {
    return (
        <div>
            <h2 className={styles.title}>Prior Work Experience -</h2>
            <div className="textBox">
                <ul className={styles.list}>
                    <li>
                        Library Monitor | Fort Hays State | Tech | 2024-2025
                    </li>
                    <li>
                        Sales Assosiate | Dollar General | 2023-2024
                    </li>
                    <li>
                        Sales Assosiate | Jamboree Foods | 2022-2024
                    </li>
                </ul>
            </div>
        </div>
    );
}
