import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy and data practices",
  description: "A plain-language summary of data handled by this Cognitive Fitness prototype.",
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="container journey-page" aria-labelledby="privacy-title">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Data and privacy</span>
      </nav>

      <header className="journey-heading">
        <p className="section-kicker">Data / current prototype</p>
        <h1 id="privacy-title">Your choices, and what this prototype handles.</h1>
        <p>
          This page summarizes the current application behavior as of 4 October 2026. It is an informational data-practices summary, not a complete legal privacy policy or a compliance claim. The production owner, privacy contact, applicable audience, and request-handling process have not yet been confirmed; those are release gates.
        </p>
      </header>

      <section className="evidence-topic" aria-labelledby="privacy-defaults-title">
        <h2 id="privacy-defaults-title">By default: no account, no saved history, no analytics SDK</h2>
        <p>
          You can explore the learning pages and use the activities without signing in. Answers and scores are computed in your browser; the app does not send them to a score service. The current application bundle has no advertising or analytics SDK. Do not enter identifying, health, or other sensitive information into this educational prototype.
        </p>
        <p>
          When you open a hosted page, the hosting provider still receives the network request needed to deliver it. Depending on the deployment and its settings, the provider may process operational details such as IP address, requested path, device information, and security or diagnostic logs. Those records are governed by the hosting provider’s terms and retention, not by the in-app clear button.
        </p>
      </section>

      <section className="evidence-topic" aria-labelledby="privacy-local-title">
        <h2 id="privacy-local-title">Optional progress saved in this browser</h2>
        <p>
          On <Link href="/train">Train</Link>, nothing is persisted until you choose “Save this goal on this device.” That choice stores the selected goal, optional schedule start/pause dates, and up to 200 recent task summaries in this browser’s local storage. A summary contains the activity, mode, correct/total count, completion time, and—if applicable—the public challenge code. Raw answers, names, accounts, and reflection text are not stored.
        </p>
        <p>
          You can inspect recent history, export a JSON file, and clear the saved copy on the same page. If browser deletion fails, the page warns you to use the browser’s site-data settings. An exported file, browser backup, or copy on a shared device is outside the app’s control; anyone using the same browser profile may be able to see saved data.
        </p>
      </section>

      <section className="evidence-topic" aria-labelledby="privacy-development-title">
        <h2 id="privacy-development-title">Temporary choices in the Development Atlas</h2>
        <p>
          On <Link href="/develop">Develop</Link>, selected pathways and the generated practice menu stay in page memory only and disappear when you reload or leave. The atlas does not ask for free-text reflections, health details, feelings, names, or a schedule, and it does not write these choices to local storage or send them to a server. Copying the public pathway text is a deliberate browser action; after that, the copied text is governed by the app or destination you choose.
        </p>
      </section>

      <section className="evidence-topic" aria-labelledby="privacy-sharing-title">
        <h2 id="privacy-sharing-title">Friend-challenge links are shareable data</h2>
        <p>
          A challenge link can include a versioned game/event code and, when you choose to share a result, a self-reported correct/total count. The recipient can see that information. Codes do not include a name, but query strings may remain in browser history and may be visible to the hosting provider as part of a page request. These results are not verified or ranked. Do not add private information to a challenge link or share it with someone you do not trust.
        </p>
      </section>

      <section className="evidence-topic" aria-labelledby="privacy-paths-title">
        <h2 id="privacy-paths-title">Guided paths, search, and My practice</h2>
        <p>
          <Link href="/journeys">Guided paths</Link> are static, ordered links to pages that already exist. Following one
          records nothing: there is no completion state, no account, and no telemetry on step order or time spent.
          <Link href="/search"> Search</Link> runs inside your browser over the reviewed content this site ships; your
          words are not sent to a server, logged, or stored, and the page carries <code>robots: noindex</code>.
          <Link href="/progress"> My practice</Link> only reads the same optional local records described above and
          presents them per activity, so clearing or exporting in Train changes what this page can show.
        </p>
      </section>

      <section className="evidence-topic" aria-labelledby="privacy-puters-title">
        <h2 id="privacy-puters-title">Optional Puter guide: your account, your browser, your allowance</h2>
        <p>
          A second, optional guide mode can load <code>https://js.puter.com/v2/</code> directly in your browser. This
          deployment holds no Puter credentials and runs no server step for it. Choosing that mode means: (1) a
          third-party script from puter.com executes on the page, which is a real trust decision rather than a formality;
          (2) you sign in to Puter in a popup, so Puter sees that sign-in and the resulting requests; (3) your question,
          one optional reviewed public item, and a fixed tool list are sent from your browser to Puter and its chosen
          model provider; and (4) usage is measured against your Puter account. Puter documents a free monthly allowance
          with paid usage beyond it, so this is user-pays rather than unlimited free AI, and this app cannot see, cap, or
          refund your usage.
        </p>
        <p>
          Nothing else is attached: no saved sessions, no challenge codes, no goals, no reading preferences, and no prior
          messages. The guide mode is off until you select it, consent is required per message, and the feature is
          adults-only by self-declaration. Turning the mode away entirely is a deployment setting
          (<code>{'NEXT_PUBLIC_COACH_PUTER_ENABLED="false"'}</code>), which removes the option from the page.
        </p>
        <p>
          <a href="https://docs.puter.com/user-pays-model/" target="_blank" rel="noreferrer">Puter user-pays model <span className="visually-hidden">(opens in a new tab)</span></a>
          {" · "}
          <a href="https://developer.puter.com/pricing/" target="_blank" rel="noreferrer">Puter pricing <span className="visually-hidden">(opens in a new tab)</span></a>
        </p>
      </section>

      <section className="evidence-topic" aria-labelledby="privacy-accounts-title">
        <h2 id="privacy-accounts-title">Why there is no Google sign-in, and what would change that</h2>
        <p>
          Sign-in was deliberately not added. Authenticating with a Google account is separate from authorization to use
          that person&apos;s Gemini or API quota, and a consumer Gemini session is not a billable API surface an app may
          borrow. Adding an account here would also require a server session, a user record, token storage, and a
          deletion process this prototype does not have — while offering no capability the product needs, since core
          learning and practice are account-free by design. If accounts are introduced later, they will be justified by a
          documented need (such as cross-device sync), kept separate from any model authorization, and covered by a real
          privacy policy with a named contact.
        </p>
      </section>

      <section className="evidence-topic" aria-labelledby="privacy-ai-title">
        <h2 id="privacy-ai-title">Optional AI guide: separate provider sharing</h2>
        <p>
          The `/coach` workspace is useful without AI. In this checkout the operator-configured OpenAI provider is disabled unless an operator sets both a server-only feature flag and an API key, and no key is present. If an operator enables it, the page requires an adult self-declaration and fresh consent for each reply. This is not age verification; there is no guardian-consent flow, so the provider must not be enabled for minors or a mixed-age audience on this control alone.
        </p>
        <p>
          After you choose to send, the app transmits the current question as typed, one optional reviewed public item if selected, and fixed tool instructions to the OpenAI API. It does not attach prior messages, local scores, saved goals, activity history, or the private reflection note. Do not include personal, identifying, score, or health details. The page uses `store: false`, which disables Responses API application-state storage but is not Zero Data Retention; OpenAI states that abuse-monitoring logs may retain prompts and responses for up to 30 days by default, subject to exceptions. The app cannot delete provider-side records.
        </p>
        <p>
          <a href="https://developers.openai.com/api/docs/guides/your-data" target="_blank" rel="noreferrer">OpenAI API data controls <span className="visually-hidden">(opens in a new tab)</span></a>
          {" · "}
          <a href="https://openai.com/policies/services-agreement/" target="_blank" rel="noreferrer">OpenAI Services Agreement <span className="visually-hidden">(opens in a new tab)</span></a>
        </p>
      </section>

      <section className="evidence-topic" aria-labelledby="privacy-choices-title">
        <h2 id="privacy-choices-title">Choices and unresolved release details</h2>
        <ul>
          <li>Use the activities without creating a profile or saving progress; clear or export an opted-in local save from `/train`.</li>
          <li>Share challenge/result links only when you choose; the codes are public, self-reported, and unverified.</li>
          <li>Use the local Coach workspace without sending a provider request. If AI is enabled for a deployment, review the notice and consent before each send.</li>
          <li>The app has no account, remote user database, or in-app request portal. A privacy contact and a formal access/deletion-request process have not been designated yet.</li>
          <li>Reading options (text size, contrast, spacing, typeface, motion, reading guide, link underlining) are stored in this browser under one key and affect presentation only; clearing site data removes them.</li>
          <li>If you use the Puter guide, sign-out ends your Puter session in this browser; anything already sent is governed by Puter and the model provider it used, not by an in-app control.</li>
        </ul>
        <p>
          If deployed on Vercel, review its current <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noreferrer">Privacy Notice <span className="visually-hidden">(opens in a new tab)</span></a> for platform-level processing. Before public production, the project owner must confirm the audience, hosting/provider configuration, applicable legal duties, user contact, and deletion/incident process with an appropriate reviewer.
        </p>
      </section>
    </main>
  );
}
