import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function LibrarianLayout({ children }) {
    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="librarian" />
                <main style={styles.main}>
                    {children}
                </main>
            </div>
        </>
    );
}

const styles = {
    layout: {
        display: 'flex'
    },
    main: {
        flex: 1,
        padding: '2rem',
        backgroundColor: '#ecf0f1',
        minHeight: 'calc(100vh - 60px)',
        marginLeft: '260px'
    }
};
