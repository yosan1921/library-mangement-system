import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function MemberPage() {
    const perks = [
        { icon: '🔍', title: 'Search Books', text: 'Browse and search the full library catalogue by title, author, or genre.' },
        { icon: '📅', title: 'Reserve Books', text: 'Reserve books in advance and get notified when they are available.' },
        { icon: '📖', title: 'Track Borrows', text: 'View your current borrowings and due dates in one place.' },
        { icon: '💰', title: 'Manage Fines', text: 'Check and pay any outstanding fines quickly online.' },
        { icon: '🔔', title: 'Notifications', text: 'Receive reminders before due dates so you never get a fine.' },
        { icon: '📜', title: 'Borrow History', text: 'See your full borrowing history and favourite books anytime.' },
    ];

    return (
        <>
            <Navbar />
            <div className="mp-wrapper">
                {/* Hero */}
                <header className="mp-hero">
                    <div className="mp-blob mp-blob-1" />
                    <div className="mp-blob mp-blob-2" />
                    <div className="mp-hero-content">
                        <span className="mp-badge">For Members</span>
                        <h1 className="mp-hero-title">Your Personal<br /><span className="mp-gradient">Library Hub</span></h1>
                        <p className="mp-hero-sub">
                            Discover books, track your loans, manage reservations, and stay on top of
                            due dates — all from your member portal.
                        </p>
                        <Link href="/login" className="mp-cta-btn">Access Member Portal →</Link>
                    </div>
                </header>

                {/* Perks Grid */}
                <main className="mp-main">
                    <h2 className="mp-section-title">Member Benefits</h2>
                    <div className="mp-grid">
                        {perks.map((p, i) => (
                            <div key={i} className="mp-card">
                                <span className="mp-card-icon">{p.icon}</span>
                                <h3 className="mp-card-title">{p.title}</h3>
                                <p className="mp-card-text">{p.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA Box */}
                    <div className="mp-cta-box">
                        <h2 className="mp-cta-title">Ready to explore the library?</h2>
                        <p className="mp-cta-sub">Log in with your member credentials to start borrowing books today.</p>
                        <Link href="/login" className="mp-cta-btn mp-cta-btn--dark">Login Now →</Link>
                    </div>
                </main>
            </div>

            <style jsx global>{`
                .mp-wrapper { min-height:100vh;background:#f8fafc;padding-bottom:5rem; }

                /* Hero */
                .mp-hero {
                    position:relative;
                    padding:clamp(5rem,12vw,9rem) 1.5rem clamp(4rem,8vw,7rem);
                    text-align:center;background:#0f172a;color:white;overflow:hidden;
                }
                .mp-blob { position:absolute;border-radius:50%;filter:blur(80px);opacity:.4;pointer-events:none; }
                .mp-blob-1 { width:360px;height:360px;background:#10b981;top:-100px;left:-80px;animation:mpFloat 20s infinite alternate; }
                .mp-blob-2 { width:280px;height:280px;background:#3b82f6;bottom:-60px;right:-60px;animation:mpFloat 16s infinite alternate-reverse; }
                @keyframes mpFloat { from{transform:translate(0,0) scale(1)} to{transform:translate(40px,40px) scale(1.1)} }

                .mp-hero-content { position:relative;z-index:10;max-width:820px;margin:0 auto; }
                .mp-badge {
                    display:inline-block;padding:.45rem 1.2rem;
                    background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.35);
                    border-radius:100px;color:#6ee7b7;font-weight:700;font-size:.8rem;
                    letter-spacing:.08em;text-transform:uppercase;margin-bottom:1.5rem;
                }
                .mp-hero-title {
                    font-size:clamp(2.4rem,7vw,4.2rem);font-weight:900;
                    line-height:1.1;margin-bottom:1.25rem;letter-spacing:-.04em;
                }
                .mp-gradient {
                    background:linear-gradient(135deg,#34d399,#60a5fa);
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                }
                .mp-hero-sub {
                    font-size:clamp(1rem,2.5vw,1.3rem);color:#94a3b8;
                    max-width:640px;margin:0 auto 2.5rem;line-height:1.7;font-weight:500;
                }
                .mp-cta-btn {
                    display:inline-block;padding:.9rem 2.2rem;
                    background:linear-gradient(135deg,#10b981,#3b82f6);
                    color:white;border-radius:12px;font-weight:700;font-size:1rem;
                    text-decoration:none;
                    box-shadow:0 8px 24px rgba(16,185,129,.4);
                    transition:all .3s ease;
                }
                .mp-cta-btn:hover { transform:translateY(-3px);box-shadow:0 12px 32px rgba(16,185,129,.55); }

                /* Main */
                .mp-main { max-width:1200px;margin:-3rem auto 0;padding:0 1.5rem;position:relative;z-index:20; }
                .mp-section-title {
                    text-align:center;font-size:clamp(1.75rem,4vw,2.5rem);
                    font-weight:900;color:#0f172a;margin-bottom:2.5rem;letter-spacing:-.03em;
                }

                /* Grid */
                .mp-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin-bottom:3.5rem; }
                .mp-card {
                    background:white;border-radius:24px;padding:2rem;
                    border:1px solid #e2e8f0;
                    transition:all .35s cubic-bezier(.175,.885,.32,1.275);cursor:default;
                    box-shadow:0 4px 12px rgba(0,0,0,.04);
                }
                .mp-card:hover { transform:translateY(-8px);box-shadow:0 20px 40px rgba(16,185,129,.12);border-color:#a7f3d0; }
                .mp-card-icon { font-size:2.4rem;display:block;margin-bottom:1.1rem; }
                .mp-card-title { font-size:1.15rem;font-weight:800;color:#0f172a;margin-bottom:.6rem; }
                .mp-card-text  { font-size:.97rem;color:#64748b;line-height:1.65;font-weight:500; }

                /* CTA Box */
                .mp-cta-box {
                    background:linear-gradient(135deg,#064e3b,#065f46);
                    border-radius:28px;padding:3rem 2.5rem;text-align:center;
                    box-shadow:0 12px 40px rgba(6,78,59,.35);
                }
                .mp-cta-title { font-size:clamp(1.5rem,4vw,2rem);font-weight:900;color:white;margin-bottom:.75rem; }
                .mp-cta-sub   { color:#6ee7b7;font-size:1.05rem;margin-bottom:2rem; }
                .mp-cta-btn--dark { background:white;color:#065f46;box-shadow:0 6px 20px rgba(0,0,0,.15); }
                .mp-cta-btn--dark:hover { transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.25); }
            `}</style>
        </>
    );
}
