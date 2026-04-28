export default function PrivacyPage() {
  return (
    <main className="container legal">
      <h1>Privacy Policy</h1>
      <p>Last updated: April 2026</p>
      <p>
        Palm Reader collects account information, palm photos, subscription status, and generated reading content so we can
        operate the service. We do not sell personal data.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Account identifiers such as email and authentication provider IDs</li>
        <li>Palm photos uploaded to generate readings</li>
        <li>Generated reading history, daily insights, and compatibility reports</li>
        <li>Subscription and purchase state from app-store billing providers</li>
        <li>Operational telemetry such as error logs and analytics events</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>Generate palm readings and daily insights</li>
        <li>Gate premium features and restore purchases</li>
        <li>Improve reliability, investigate fraud, and support customers</li>
      </ul>
      <h2>Data deletion</h2>
      <p>
        Users can request deletion inside the app. Account deletion removes the user account and associated Palm Reader data,
        subject to platform billing records retained by Apple, Google, or RevenueCat.
      </p>
      <h2>Contact</h2>
      <p>Questions: <a href="mailto:hello@palmreader.app">hello@palmreader.app</a></p>
    </main>
  );
}
