export function Footer({ year }: { year: number }) {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-mark" aria-hidden="true">✦</span>
          <div>
            <strong>星签</strong>
            <span>STARSIGN · 每日星象</span>
          </div>
        </div>
        <p className="footer-quote">「抬头看星，也看看自己。」</p>
        <div className="footer-meta">
          <a href="https://github.com/kaixinxiaobao7-ops/today-forecast" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <span aria-hidden="true">·</span>
          <span>© {year} 星签</span>
        </div>
      </div>
    </footer>
  );
}
