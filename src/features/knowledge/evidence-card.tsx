import {
  getEvidenceSourcesForClaim,
  getLimitationsForClaim,
  type KnowledgeClaim,
} from "@/features/knowledge/content";

function formatAuthors(authors: string[]): string {
  return authors.length > 2
    ? `${authors[0]}, ${authors[1]}, et al.`
    : authors.join(" & ");
}

export function EvidenceCard({ claim }: { claim: KnowledgeClaim }) {
  const sources = getEvidenceSourcesForClaim(claim);
  const limitations = getLimitationsForClaim(claim);
  const detailOnly = claim.surfacePolicy !== "beginner-summary";

  return (
    <article className="evidence-claim-card" id={`evidence-${claim.id.replaceAll(".", "-")}`}>
      <div className="evidence-claim-heading">
        <div>
          <p className="mini-label">{claim.kind.replaceAll("-", " ")}</p>
          <h3>{claim.title}</h3>
        </div>
        <span className="evidence-grade" aria-label={`Evidence grade ${claim.grade}`}>
          {claim.grade}
        </span>
      </div>
      {detailOnly ? (
        <details className="claim-disclosure">
          <summary>
            {claim.surfacePolicy === "research-detail-only"
              ? "Research detail — not a personal score"
              : "Read the evidence and its limits"}
          </summary>
          <ClaimDetail claim={claim} sources={sources} limitations={limitations} />
        </details>
      ) : (
        <>
          <p className="evidence-claim-copy">{claim.wording}</p>
          <p className="evidence-label">{claim.evidenceLabel}</p>
          <details className="claim-disclosure">
            <summary>Source, population, and limitations</summary>
            <ClaimDetail claim={claim} sources={sources} limitations={limitations} />
          </details>
        </>
      )}
    </article>
  );
}

function ClaimDetail({
  claim,
  sources,
  limitations,
}: {
  claim: KnowledgeClaim;
  sources: ReturnType<typeof getEvidenceSourcesForClaim>;
  limitations: ReturnType<typeof getLimitationsForClaim>;
}) {
  return (
    <div className="claim-detail-body">
      <p className="evidence-claim-copy">{claim.wording}</p>
      <p className="evidence-label">{claim.evidenceLabel}</p>
      <dl className="claim-context">
        <div>
          <dt>Population</dt>
          <dd>{claim.population}</dd>
        </div>
        <div>
          <dt>Outcome</dt>
          <dd>{claim.outcome}</dd>
        </div>
        <div>
          <dt>Study design</dt>
          <dd>{claim.studyDesign}</dd>
        </div>
        <div>
          <dt>Transfer scope</dt>
          <dd>{claim.transferLevel.replaceAll("-", " ")}</dd>
        </div>
      </dl>
      <div className="claim-source-section">
        <h4>Sources</h4>
        <ul className="source-list">
          {sources.map((source) => (
            <li key={source.id}>
              <p className="source-citation">
                {formatAuthors(source.authors)} ({source.year}). {source.title}. {source.publication}.
              </p>
              <a href={source.url} target="_blank" rel="noreferrer">
                Read source <span className="visually-hidden">(opens in a new tab)</span>
              </a>
              <a href={`https://doi.org/${source.doi}`} target="_blank" rel="noreferrer">
                DOI: {source.doi} <span className="visually-hidden">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="claim-limitations">
        <h4>What this evidence does not establish</h4>
        <ul>
          {limitations.map((limitation) => (
            <li key={limitation.id}>{limitation.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
