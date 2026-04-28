function Nav() {
  return (
    <div className="container nav">
      <a className="brand" href="/">Palm Reader</a>
      <div className="navlinks">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/support">Support</a>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="container footer">
      <div>© {new Date().getFullYear()} Palm Reader</div>
      <div className="footerlinks">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/refunds">Refunds</a>
        <a href="/support">Support</a>
        <a href="mailto:hello@palmreader.app">hello@palmreader.app</a>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      <Nav />
      <section className="container hero">
        <div>
          <div className="badge">AI-powered palm readings built for conversion, retention, and low inference burn</div>
          <h1>Your palm, interpreted in seconds.</h1>
          <p className="lead">
            Palm Reader transforms a palm photo into an entertaining personality reading, recurring daily insights,
            and premium compatibility reports. The product is designed to feel magical for users while staying sane on cost.
          </p>
          <div className="ctaRow">
            <a className="button primary" href="mailto:hello@palmreader.app?subject=Palm%20Reader%20waitlist">Join launch list</a>
            <a className="button secondary" href="#pricing">See pricing</a>
          </div>
        </div>
        <div className="panel">
          <div className="eyebrow">Launch shape</div>
          <div className="kv">
            <div>
              <strong>Free</strong>
              <p>1 curated demo reading. No free-tier marginal AI cost.</p>
            </div>
            <div>
              <strong>Paid</strong>
              <p>Real palm readings, recurring insights, and compatibility unlock.</p>
            </div>
            <div>
              <strong>Protection</strong>
              <p>Server-side rate limits, cached insights, and paywalled premium compute.</p>
            </div>
            <div>
              <strong>Positioning</strong>
              <p>Entertainment-first self-reflection product with gift/share potential.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="container section">
        <h2>What makes this app feel worth paying for</h2>
        <div className="cardGrid">
          <div className="card">
            <div className="eyebrow">Personalized reading</div>
            <p>Users upload a palm image and receive a structured reading across major lines plus a clean summary.</p>
          </div>
          <div className="card">
            <div className="eyebrow">Daily ritual</div>
            <p>Short daily insight content creates habit without forcing expensive high-token generations every day.</p>
          </div>
          <div className="card">
            <div className="eyebrow">Social upsell</div>
            <p>Compatibility readings expand the app from solo curiosity into relationships, gifting, and conversation.</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="container section">
        <h2>Simple pricing built for mobile conversion</h2>
        <div className="pricing">
          <div className="card">
            <div className="eyebrow">Weekly</div>
            <div className="price">$7.99 <small>/ week</small></div>
            <p>No trial. Best for impulse buyers who want immediate full access.</p>
          </div>
          <div className="card highlight">
            <div className="eyebrow">Annual · default</div>
            <div className="price">$39.99 <small>/ year</small></div>
            <p>Includes a 3-day free trial and the clearest value story on the paywall.</p>
          </div>
          <div className="card">
            <div className="eyebrow">Lifetime</div>
            <div className="price">$99.99 <small>one-time</small></div>
            <p>High-intent option for believers and gift buyers, priced to avoid crushing annual LTV.</p>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="panel">
          <div className="eyebrow">Production posture</div>
          <h2>Ready for mobile implementation</h2>
          <p>
            The backend is positioned around cost safety, subscription gating, health monitoring, account deletion,
            webhook handling, and legal pages — so the remaining major work is the native mobile experience itself.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
