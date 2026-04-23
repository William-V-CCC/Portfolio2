import "./footer.css"; // regular CSS import

export default function Footer() {
    return (
        <footer className="footer">
            <div className="BottomRight">
                <p>Email: williamvance9124@gmail.com</p>
                <p>Phone: (970)-630-9124</p>
                <a
                    href="/resume.docx.pdf"
                    download
                    className="resumeButton"
                >
                    Resume Download
                </a>
            </div>
        </footer>
    );
}
