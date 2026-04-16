export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
        <p>© {new Date().getFullYear()} VoltStore. All rights reserved.</p>
      </div>
    </footer>
  );
}
