from __future__ import annotations

import copy
import contextlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))

import agent_flow  # noqa: E402


class AgentFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.workflow, cls.state = agent_flow.load_bundle()

    def test_committed_workflow_and_state_validate(self) -> None:
        self.assertEqual(agent_flow.validate_workflow(self.workflow), [])
        self.assertEqual(agent_flow.validate_state(self.workflow, self.state), [])

    def fresh_state(self) -> dict:
        state = copy.deepcopy(self.state)
        for stage_id in state["stages"]:
            if stage_id != "S0":
                state["stages"][stage_id] = {"status": "pending"}
        return state

    def mark_done(self, state: dict, *stage_ids: str) -> None:
        for stage_id in stage_ids:
            state["stages"][stage_id] = copy.deepcopy(self.state["stages"][stage_id])

    def test_first_ready_stage_is_product_and_evidence(self) -> None:
        self.assertEqual(agent_flow.ready_stages(self.workflow, self.fresh_state()), ["S1"])

    def test_vertical_slice_foundation_and_content_can_run_in_parallel(self) -> None:
        state = self.fresh_state()
        self.mark_done(state, "S1", "S2", "S3")
        self.assertEqual(agent_flow.ready_stages(self.workflow, state), ["S4", "S5"])
        for foundation_scope in agent_flow.stage_write_scopes(agent_flow.stage_map(self.workflow)["S4"]):
            for content_scope in agent_flow.stage_write_scopes(agent_flow.stage_map(self.workflow)["S5"]):
                self.assertFalse(agent_flow.scopes_conflict(foundation_scope, content_scope))

    def test_scope_conflicts_include_nested_paths_but_not_siblings(self) -> None:
        self.assertTrue(agent_flow.scopes_conflict("app/", "app/components/Button.tsx"))
        self.assertTrue(agent_flow.scopes_conflict("docs/PLAN.md", "docs/PLAN.md"))
        self.assertTrue(agent_flow.scopes_conflict(".", "content/graph.json"))
        self.assertTrue(agent_flow.scopes_conflict("@repo/.github/workflows/", "@repo/.github/workflows/quality.yml"))
        self.assertFalse(agent_flow.scopes_conflict("app/", "content/"))
        self.assertFalse(agent_flow.scopes_conflict("docs/PLAN.md", "docs/SCIENCE.md"))
        self.assertFalse(agent_flow.scopes_conflict("@repo/.github/workflows/", "docs/RELEASE-CHECKLIST.md"))

    def test_repository_root_scope_namespace_rejects_path_traversal(self) -> None:
        workflow = copy.deepcopy(self.workflow)
        s13 = agent_flow.stage_map(workflow)["S13"]
        s13["workstreams"][0]["write_scopes"].append("@repo/../outside.yml")
        errors = agent_flow.validate_workflow(workflow)
        self.assertTrue(any("unsafe write scope" in error for error in errors), errors)

    def test_prompt_contains_stage_specific_scope_and_review_gate(self) -> None:
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            result = agent_flow.command_prompt(self.workflow, self.state, "S1")
        text = output.getvalue()
        self.assertEqual(result, 0)
        self.assertIn("Assignment: S1", text)
        self.assertIn("docs/EVIDENCE-LEDGER.md", text)
        self.assertIn("Evidence and scientific-integrity reviewer", text)
        self.assertIn("Acceptance criteria", text)

    def test_workstream_prompt_can_be_dispatched_independently(self) -> None:
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            result = agent_flow.command_prompt(self.workflow, self.state, "S1", "evidence-ledger")
        text = output.getvalue()
        self.assertEqual(result, 0)
        self.assertIn("Assignment: S1 / evidence-ledger", text)
        self.assertIn("Evidence and scientific-integrity reviewer", text)
        self.assertNotIn("### requirements —", text)

    def test_start_and_finish_record_a_reviewed_stage(self) -> None:
        state = self.fresh_state()
        with tempfile.TemporaryDirectory() as directory:
            state_path = Path(directory) / "state.json"
            with patch.object(agent_flow, "STATE_PATH", state_path):
                with contextlib.redirect_stdout(io.StringIO()):
                    agent_flow.command_start(self.workflow, state, "S1", "product/evidence team")
                started = json.loads(state_path.read_text(encoding="utf-8"))
                self.assertEqual(started["stages"]["S1"]["status"], "in_progress")
                with contextlib.redirect_stdout(io.StringIO()):
                    agent_flow.command_finish(
                        self.workflow,
                        started,
                        "S1",
                        "independent reviewer",
                        ["docs/PRODUCT.md"],
                    )
                finished = json.loads(state_path.read_text(encoding="utf-8"))
                self.assertEqual(finished["stages"]["S1"]["status"], "done")
                self.assertEqual(finished["stages"]["S1"]["reviewed_by"], "independent reviewer")

    def test_start_rejects_overlapping_active_write_scopes(self) -> None:
        workflow = copy.deepcopy(self.workflow)
        state = self.fresh_state()
        self.mark_done(state, "S1", "S2", "S3")
        state["stages"]["S4"].update({"status": "in_progress", "started_at": "now", "started_by": "builder"})
        content_stream = workflow["stages"][5]["workstreams"][0]
        content_stream["write_scopes"].append("app/")
        with self.assertRaisesRegex(agent_flow.WorkflowError, "write-scope conflict with S4"):
            agent_flow.command_start(workflow, state, "S5", "content builder")

    def test_unsafe_evidence_path_is_rejected(self) -> None:
        with self.assertRaises(agent_flow.WorkflowError):
            agent_flow._evidence_file("../README.md")

    def test_cycle_is_rejected(self) -> None:
        workflow = copy.deepcopy(self.workflow)
        workflow["stages"][0]["depends_on"] = ["S10"]
        errors = agent_flow.validate_workflow(workflow)
        self.assertTrue(any("dependency cycle" in error for error in errors), errors)


if __name__ == "__main__":
    unittest.main()
