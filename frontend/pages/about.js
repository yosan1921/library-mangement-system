import Navbar from '../components/Navbar';

export default function About() {
    const features = [
        { title: 'Book Cataloging', icon: '📚', text: 'Easily add, update, and categorize books with automated ISBN detection.', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', shadow: 'rgba(59,130,246,0.2)' },
        { title: 'Member Management', icon: '👥', text: 'Keep track of library members, registration info, and full borrowing history.', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', shadow: 'rgba(139,92,246,0.2)' },
        { title: 'Borrow & Return', icon: '🔄', text: 'Streamlined process with automated due date tracking and notifications.', gradient: 'linear-gradient(135deg, #10b981, #047857)', shadow: 'rgba(16,185,129,0.2)' },
        { title: 'Reservations', icon: '📅', text: 'Allow members to reserve books in advance and get notified when ready.', gradient: 'linear-gradient(135deg, #f59e0b, #b45309)', shadow: 'rgba(245,158,11,0.2)' },
        { title: 'Reports & Analytics', icon: '📊', text: 'Generate deep reports for inventory, activity trends, and fine collections.', gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)', shadow: 'rgba(239,68,68,0.2)' },
    ];

    const benefits = [
        "Saves time for librarians and staff through automation",
        "Improves user experience for all library members",
        "Reduces errors in record keeping and book tracking",
        "Provides data-driven insights for better decision-making"
    ];

    return (
        <>
            <Navbar />
            <div className="about-wrapper">
                {/* ── Hero Section ── */}
                <header className="about-hero">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                    <div className="blob blob-3"></div>

                    <div className="hero-content">
                        <span className="hero-badge">About Our Platform</span>
                        <h1 className="hero-title">Library Management <br /><span className="title-gradient">Redefined</span></h1>
                        <p className="hero-subtitle">
                            Empowering libraries with cutting-edge digital solutions to simplify resource management
                            and enhance the reading experience.
                        </p>
                    </div>
                </header>

                <main className="about-container">
                    {/* ── Glassmorphism Main Card ── */}
                    <article className="glass-card about-main-card">
                        <div className="card-section">
                            <h2 className="section-title">
                                <span className="title-icon">🚀</span> Our Mission
                            </h2>
                            <p className="section-text">
                                To provide a digital solution that makes library management faster, accurate, and accessible
                                for both librarians and readers. We believe in the power of organized knowledge and
                                seamless accessibility.
                            </p>
                        </div>

                        <div className="card-separator"></div>

                        <div className="card-section">
                            <h2 className="section-title">
                                <span className="title-icon">✨</span> Overview
                            </h2>
                            <p className="section-text">
                                Our Library Management System (LMS) is built on modern architecture to simplify the
                                complexities of library administration. It helps librarians, students, and staff efficiently
                                organize, track, and borrow books, ensuring a smooth and user-friendly experience at every touchpoint.
                            </p>
                        </div>
                    </article>

                    {/* ── Features Grid ── */}
                    <section className="features-section">
                        <h2 className="grid-title">Core Capabilities</h2>
                        <div className="features-grid">
                            {features.map((f, i) => (
                                <div key={i} className="feature-card" style={{ '--card-shadow': f.shadow }}>
                                    <div className="feature-icon-wrapper" style={{ background: f.gradient, boxShadow: `0 8px 20px ${f.shadow}` }}>
                                        {f.icon}
                                    </div>
                                    <h3 className="feature-title">{f.title}</h3>
                                    <p className="feature-text">{f.text}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Benefits & Vision ── */}
                    <div className="dual-section">
                        <section className="glass-card benefits-card">
                            <h2 className="section-title">Why Choose Us?</h2>
                            <ul className="benefits-list">
                                {benefits.map((b, i) => (
                                    <li key={i} className="benefit-item">
                                        <span className="check-icon">✓</span>
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="vision-card">
                            <div className="vision-content">
                                <span className="vision-icon">👁️</span>
                                <h2 className="vision-title">Our Vision</h2>
                                <p className="vision-text">
                                    To create a modern, digital library environment where managing and accessing books is fast,
                                    simple, and organized for everyone, everywhere.
                                </p>
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            <style jsx global>{`
                .about-wrapper {
                    min-height: 100vh;
                    background: #f8fafc;
                    padding-bottom: 5rem;
                }

                /* ── Hero ── */
                .about-hero {
                    position: relative;
                    padding: clamp(4rem, 10vw, 8rem) 1.5rem;
                    text-align: center;
                    background: #0f172a;
                    color: white;
                    overflow: hidden;
                }
                .hero-content {
                    position: relative;
                    z-index: 10;
                    max-width: 900px;
                    margin: 0 auto;
                }
                .hero-badge {
                    display: inline-block;
                    padding: 0.5rem 1.25rem;
                    background: rgba(59, 130, 246, 0.15);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 100px;
                    color: #60a5fa;
                    font-weight: 700;
                    font-size: 0.875rem;
                    margin-bottom: 1.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .hero-title {
                    font-size: clamp(2.5rem, 8vw, 4.5rem);
                    font-weight: 900;
                    line-height: 1.1;
                    margin-bottom: 1.5rem;
                    letter-spacing: -0.04em;
                }
                .title-gradient {
                    background: linear-gradient(135deg, #60a5fa, #c084fc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .hero-subtitle {
                    font-size: clamp(1.1rem, 3vw, 1.4rem);
                    color: #94a3b8;
                    max-width: 700px;
                    margin: 0 auto;
                    line-height: 1.6;
                    font-weight: 500;
                }

                /* Blobs */
                .blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.4;
                    pointer-events: none;
                }
                .blob-1 {
                    width: 400px; height: 400px;
                    background: #3b82f6;
                    top: -100px; left: -100px;
                    animation: float 20s infinite alternate;
                }
                .blob-2 {
                    width: 300px; height: 300px;
                    background: #8b5cf6;
                    bottom: -50px; right: -50px;
                    animation: float 15s infinite alternate-reverse;
                }
                .blob-3 {
                    width: 250px; height: 250px;
                    background: #ec4899;
                    top: 20%; left: 40%;
                    animation: float 25s infinite alternate;
                }

                @keyframes float {
                    from { transform: translate(0, 0) scale(1); }
                    to { transform: translate(50px, 50px) scale(1.1); }
                }

                /* ── Container ── */
                .about-container {
                    max-width: 1200px;
                    margin: -4rem auto 0;
                    padding: 0 1.5rem;
                    position: relative;
                    z-index: 20;
                }

                /* Glass Card */
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 32px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
                }
                .about-main-card {
                    padding: clamp(2rem, 5vw, 4rem);
                    display: grid;
                    grid-template-columns: 1fr 1px 1fr;
                    gap: clamp(2rem, 5vw, 4rem);
                    margin-bottom: 4rem;
                }
                .card-separator {
                    background: linear-gradient(to bottom, transparent, #e2e8f0, transparent);
                }
                .section-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .title-icon {
                    background: #f1f5f9;
                    width: 48px; height: 48px;
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.25rem;
                }
                .section-text {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: #475569;
                    margin: 0;
                    font-weight: 500;
                }

                /* ── Features Grid ── */
                .features-section {
                    margin-bottom: 4rem;
                }
                .grid-title {
                    font-size: 2.25rem;
                    font-weight: 900;
                    text-align: center;
                    margin-bottom: 3rem;
                    letter-spacing: -0.02em;
                    color: #0f172a;
                }
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 1.5rem;
                }
                .feature-card {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 28px;
                    border: 1px solid #f1f5f9;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: default;
                    position: relative;
                }
                .feature-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px var(--card-shadow);
                    border-color: transparent;
                }
                .feature-icon-wrapper {
                    width: 64px; height: 64px;
                    border-radius: 18px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.8rem;
                    color: white;
                    margin-bottom: 1.75rem;
                    transition: transform 0.4s ease;
                }
                .feature-card:hover .feature-icon-wrapper {
                    transform: scale(1.1) rotate(-5deg);
                }
                .feature-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    margin-bottom: 0.75rem;
                    color: #0f172a;
                }
                .feature-text {
                    font-size: 1rem;
                    line-height: 1.6;
                    color: #64748b;
                    margin: 0;
                    font-weight: 500;
                }

                /* ── Benefits & Vision ── */
                .dual-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }
                .benefits-card {
                    padding: 3rem;
                }
                .benefits-list {
                    list-style: none;
                    padding: 0;
                    margin: 1.5rem 0 0;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .benefit-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 1.05rem;
                    font-weight: 600;
                    color: #475569;
                }
                .check-icon {
                    flex-shrink: 0;
                    width: 24px; height: 24px;
                    background: #dcfce7;
                    color: #16a34a;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 900;
                }

                .vision-card {
                    background: linear-gradient(135deg, #0f172a, #1e293b);
                    padding: 3rem;
                    border-radius: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.2);
                }
                .vision-card::after {
                    content: "";
                    position: absolute;
                    width: 200px; height: 200px;
                    background: rgba(59, 130, 246, 0.1);
                    border-radius: 50%;
                    top: -50px; right: -50px;
                    filter: blur(40px);
                }
                .vision-icon {
                    display: block;
                    font-size: 3rem;
                    margin-bottom: 1.5rem;
                }
                .vision-title {
                    font-size: 2rem;
                    font-weight: 900;
                    margin-bottom: 1rem;
                    letter-spacing: -0.02em;
                }
                .vision-text {
                    font-size: 1.2rem;
                    line-height: 1.7;
                    color: #94a3b8;
                    margin: 0;
                    max-width: 400px;
                }

                /* ── Responsive ── */
                @media (max-width: 1024px) {
                    .about-main-card {
                        grid-template-columns: 1fr;
                    }
                    .card-separator {
                        height: 1px;
                        width: 100%;
                        background: linear-gradient(to right, transparent, #e2e8f0, transparent);
                    }
                    .dual-section {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .about-hero {
                        padding: 6rem 1.5rem 8rem;
                    }
                    .about-container {
                        margin-top: -6rem;
                    }
                    .about-main-card {
                        padding: 2rem;
                        border-radius: 24px;
                    }
                    .feature-card {
                        padding: 2rem;
                    }
                }
            `}</style>
        </>
    );
}
