"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  scoreWordRecall,
  type RecallScore,
} from "@/features/experiment/score-word-recall";

const WORD_LIST = ["lamp", "river", "ticket", "garden", "silver", "window"] as const;
type Phase = "ready" | "list" | "recall" | "result";

export function WordRecallExperiment() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [response, setResponse] = useState("");
  const [score, setScore] = useState<RecallScore | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousPhaseRef = useRef(phase);

  useEffect(() => {
    if (previousPhaseRef.current !== phase) {
      headingRef.current?.focus();
      previousPhaseRef.current = phase;
    }
  }, [phase]);

  function startRound() {
    setResponse("");
    setScore(null);
    setValidationMessage("");
    setPhase("list");
  }

  function submitRecall(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationMessage("");

    const result = scoreWordRecall(WORD_LIST, response);
    if (!result.ok) {
      setValidationMessage(result.message);
      return;
    }

    setScore(result);
    setPhase("result");
  }

  function resetRound() {
    setResponse("");
    setScore(null);
    setValidationMessage("");
    setPhase("ready");
  }

  return (
    <section className="experiment-panel" id="word-recall-experiment" aria-labelledby="experiment-title">
      {phase === "ready" ? (
        <div className="experiment-state">
          <p className="mini-label">READY / NO TIMER</p>
          <h2 id="experiment-title" ref={headingRef} tabIndex={-1}>
            Start when you’re ready.
          </h2>
          <p>
            You’ll see six words. Look at them for as long as you like, hide
            the list yourself, then enter any words you remember.
          </p>
          <button className="button button-primary" onClick={startRound} type="button">
            Show the word list
          </button>
        </div>
      ) : null}

      {phase === "list" ? (
        <div className="experiment-state">
          <p className="mini-label">STEP 1 / LOOK AT THE LIST</p>
          <h2 id="experiment-title" ref={headingRef} tabIndex={-1}>
            Take the time you need.
          </h2>
          <p id="word-list-instructions">
            When you are ready, choose “Hide list and recall.” Nothing will
            disappear automatically.
          </p>
          <ul className="word-list" aria-label="Six words to look at">
            {WORD_LIST.map((word) => <li key={word}>{word}</li>)}
          </ul>
          <button
            className="button button-primary"
            onClick={() => setPhase("recall")}
            type="button"
          >
            Hide list and recall
          </button>
          <p className="field-hint">You can leave at any time; your response is not saved.</p>
        </div>
      ) : null}

      {phase === "recall" ? (
        <div className="experiment-state">
          <p className="mini-label">STEP 2 / RECALL</p>
          <h2 id="experiment-title" ref={headingRef} tabIndex={-1}>
            Which words come to mind?
          </h2>
          <form className="recall-form" onSubmit={submitRecall}>
            <label htmlFor="recalled-words">Words you recall</label>
            <p className="field-hint" id="recall-help">
              Separate words with spaces, commas, or new lines. There is no
              time limit. You may submit a blank response.
            </p>
            <textarea
              id="recalled-words"
              name="recalledWords"
              rows={5}
              maxLength={1_200}
              aria-invalid={validationMessage ? true : undefined}
              aria-describedby={validationMessage ? "recall-help recall-error" : "recall-help"}
              onChange={(event) => {
                setResponse(event.target.value);
                if (validationMessage) setValidationMessage("");
              }}
              value={response}
            />
            {validationMessage ? (
              <p className="validation-message" id="recall-error" role="alert">
                {validationMessage}
              </p>
            ) : null}
            <div className="experiment-actions">
              <button className="button button-primary" type="submit">
                See this round’s result
              </button>
              <Link className="button button-quiet" href="/explore/memory">
                Leave and return to memory
              </Link>
            </div>
          </form>
        </div>
      ) : null}

      {phase === "result" && score ? (
        <div className="experiment-state experiment-result" aria-labelledby="experiment-title">
          <p className="mini-label">RESULT / THIS ROUND ONLY</p>
          <h2 id="experiment-title" ref={headingRef} tabIndex={-1}>
            Your recall result
          </h2>
          <p className="score-statement" role="status" aria-live="polite">
            You recalled {score.correctCount} of {score.totalCount} words in this round.
          </p>
          <dl className="result-details">
            <div>
              <dt>Words you entered from the list</dt>
              <dd>{score.correctWords.length > 0 ? score.correctWords.join(", ") : "None this round"}</dd>
            </div>
            <div>
              <dt>Words from the list not entered</dt>
              <dd>{score.missedWords.length > 0 ? score.missedWords.join(", ") : "None"}</dd>
            </div>
          </dl>
          {score.duplicateCount > 0 || score.unrecognizedCount > 0 ? (
            <p className="field-hint">
              Repeated words were counted once. Entries not on the list did not
              add to the count.
            </p>
          ) : null}
          <div className="result-boundary">
            <h3>What this result means</h3>
            <p>
              It counts distinct listed words entered in this one round. It is
              not a validated test and cannot describe your overall memory,
              working-memory capacity, attention, intelligence, health, or how
              well you will remember information later.
            </p>
            <p>
              Repeating the same list is a new practice round, not an independent
              measurement; familiarity may change what happens.
            </p>
          </div>
          <nav className="result-next-steps" aria-label="Next steps">
            <a className="text-link" href="#lab-evidence">
              Read the research context and limits <span aria-hidden="true">↓</span>
            </a>
            <Link className="text-link" href="/explore/retrieval-practice">
              Explore retrieval practice <span aria-hidden="true">→</span>
            </Link>
            <Link className="text-link" href="/explore/memory">
              Return to memory <span aria-hidden="true">→</span>
            </Link>
          </nav>
          <button className="button button-outline" onClick={resetRound} type="button">
            Try another round
          </button>
        </div>
      ) : null}
    </section>
  );
}
