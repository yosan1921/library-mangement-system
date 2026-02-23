import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function LibrarianPage() {
    const duties = [
        { icon: '📚', title: 'Catalogue Management', text: 'Add, update, and organise the entire book collection with ease.' },
        { icon: '🔄', title: 'Issue & Return Books', text: 'Process borrowing and returns with automated due-date tracking.' },
        { icon: '👥', title: 'Member Assistance', text: 'Help members find books, manage accounts, and resolve issues.' },
        { icon: '⚠️', title: 'Overdue & Fines', text: 'Monitor overdue items and collect fines with one-click reporting.' },
        { icon: '📅', title: 'Reservations', text: 'Accept and manage book reservation requests from members.' },
        { icon: '📊', title: 'Reports', text: 'Generate daily, weekly, or monthly activity and inventory reports.' },
    ];

    return (
        <>
            <Navbar />
            <div className="lp-wrapper">
                {/* Hero */}
                <header className="lp-hero">
                    <div className="lp-blob lp-blob-1" />
                    <div className="lp-blob lp-blob-2" />
                    <div className="lp-hero-content">
                        <span className="lp-badge">For Librarians</span>
                        <h1 className="lp-hero-title">Your Digital Library<br /><span className="lp-gradient">Command Centre</span></h1>
                        <p className="lp-hero-sub">
                            Everything a librarian needs — book management, member services, reports, and
                            more — all in one modern dashboard.
                        </p>
                        <Link href="/login" className="lp-cta-btn">Access Librarian Portal →</Link>
                    </div>
                </header>

                {/* Duties Grid */}
                <main className="lp-main">
                    <h2 className="lp-section-title">What You Can Do</h2>
                    <div className="lp-grid">
                        {duties.map((d, i) => (
                            <div key={i} className="lp-card">
                                <span className="lp-card-icon">{d.icon}</span>
                                <h3 className="lp-card-title">{d.title}</h3>
                                <p className="lp-card-text">{d.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA Box */}
                    <div className="lp-cta-box">
                        <div className="lp-cta-inner">
                            <h2 className="lp-cta-title">Ready to manage the library?</h2>
                            <p className="lp-cta-sub">Log in with your librarian credentials to access your dashboard.</p>
                            <Link href="/login" className="lp-cta-btn lp-cta-btn--dark">Login Now →</Link>
                        </div>
                    </div>
                </main>
            </div>

            <style jsx global>{`
                .lp-wrapper { min-height: 100vh; background: #f8fafc; padding-bottom: 5rem; }

                /* Hero */
                .lp-hero {
                    position: relative;
                    padding: clamp(5rem,12vw,9rem) 1.5rem clamp(4rem,8vw,7rem);
                    text-align: center;
                    background: #0f172a;
                    color: white;
                    overflow: hidden;
                }
                .lp-blob {
                    position: absolute; border-radius: 50%;
                    filter: blur(80px); opacity: 0.4; pointer-events: none;
                }
                .lp-blob-1 { width:380px;height:380px;background:#3b82f6;top:-120px;left:-80px;animation:lpFloat 18s infinite alternate; }
                .lp-blob-2 { width:280px;height:280px;background:#8b5cf6;bottom:-60px;right:-60px;animation:lpFloat 22s infinite alternate-reverse; }
                @keyframes lpFloat { from{transform:translate(0,0) scale(1)} to{transform:translate(40px,40px) scale(1.1)} }

                .lp-hero-content { position:relative;z-index:10;max-width:820px;margin:0 auto; }
                .lp-badge {
                    display:inline-block;padding:.45rem 1.2rem;
                    background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.35);
                    border-radius:100px;color:#a5b4fc;font-weight:700;font-size:.8rem;
                    letter-spacing:.08em;text-transform:uppercase;margin-bottom:1.5rem;
                }
                .lp-hero-title {
                    font-size:clamp(2.4rem,7vw,4.2rem);font-weight:900;
                    line-height:1.1;margin-bottom:1.25rem;letter-spacing:-.04em;
                }
                .lp-gradient {
                    background:linear-gradient(135deg,#60a5fa,#a78bfa);
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                }
                .lp-hero-sub {
                    font-size:clamp(1rem,2.5vw,1.3rem);color:#94a3b8;
                    max-width:640px;margin:0 auto 2.5rem;line-height:1.7;font-weight:500;
                }
                .lp-cta-btn {
                    display:inline-block;padding:.9rem 2.2rem;
                    background:linear-gradient(135deg,#3b82f6,#6366f1);
                    color:white;border-radius:12px;font-weight:700;font-size:1rem;
                    text-decoration:none;
                    box-shadow:0 8px 24px rgba(59,130,246,.4);
                    transition:all .3s ease;
                }
                .lp-cta-btn:hover { transform:translateY(-3px);box-shadow:0 12px 32px rgba(59,130,246,.55); }

                /* Main */
                .lp-main { max-width:1200px;margin:-3rem auto 0;padding:0 1.5rem;position:relative;z-index:20; }
                .lp-section-title {
                    text-align:center;font-size:clamp(1.75rem,4vw,2.5rem);
                    font-weight:900;color:#0f172a;margin-bottom:2.5rem;letter-spacing:-.03em;
                }

                /* Grid */
                .lp-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin-bottom:3.5rem; }
                .lp-card {
                    background:white;border-radius:24px;padding:2rem;
                    border:1px solid #e2e8f0;
                    transition:all .35s cubic-bezier(.175,.885,.32,1.275);cursor:default;
                    box-shadow:0 4px 12px rgba(0,0,0,.04);
                }
                .lp-card:hover { transform:translateY(-8px);box-shadow:0 20px 40px rgba(59,130,246,.12);border-color:#bfdbfe; }
                .lp-card-icon { font-size:2.4rem;display:block;margin-bottom:1.1rem; }
                .lp-card-title { font-size:1.15rem;font-weight:800;color:#0f172a;margin-bottom:.6rem; }
                .lp-card-text  { font-size:.97rem;color:#64748b;line-height:1.65;font-weight:500; }

                /* CTA Box */
                .lp-cta-box {
                    background:linear-gradient(135deg,#1e1b4b,#312e81);
                    border-radius:28px;padding:3rem 2.5rem;text-align:center;
                    box-shadow:0 12px 40px rgba(49,46,129,.35);
                }
                .lp-cta-title { font-size:clamp(1.5rem,4vw,2rem);font-weight:900;color:white;margin-bottom:.75rem; }
                .lp-cta-sub   { color:#c7d2fe;font-size:1.05rem;margin-bottom:2rem; }
                .lp-cta-btn--dark { background:white;color:#312e81;box-shadow:0 6px 20px rgba(0,0,0,.15); }
                .lp-cta-btn--dark:hover { transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.25); }
            `}</style>
        </>
    );
}
