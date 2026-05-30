import { Link } from 'react-router-dom';
const HomePage = () => {

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon">₹</div>
          <h2>UdhaarKhata</h2>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn btn-outline landing-login-btn">Log In</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-headline-wrapper">
            <span className="landing-handwritten">(aur bhi)</span>
            <h1 className="landing-headline">
              Business hua<span>^</span>easy<br />
              with UdhaarKhata on Desktop
            </h1>
          </div>

          <div className="landing-signup-form">
            <Link to="/register" className="landing-get-started-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center', padding: '16px 40px' }}>
              Get Started
            </Link>
          </div>

          <div className="landing-feature-box">
            <h3>One platform for all your business needs</h3>
            <div className="landing-features">
              <div className="landing-feature-item">Manage Digital<br/>Bahi Khata</div>
              <div className="landing-feature-divider"></div>
              <div className="landing-feature-item">Send Payment Reminders for<br/>easy collection</div>
            </div>
          </div>
        </div>

        <div className="landing-hero-visuals">
          <img src="/hero-illustration.png" alt="Shopkeeper" className="landing-illustration" />
          <img src="/app-mockup.png" alt="App Mockup" className="landing-app-mockup" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
