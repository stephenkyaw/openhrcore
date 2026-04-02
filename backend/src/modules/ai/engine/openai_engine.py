"""OpenAI-based AI engine for CV screening."""

from __future__ import annotations

import json

import httpx
import structlog

from src.modules.ai.engine.base import AIEngine
from src.modules.ai.schemas.screening import ScreeningInput, ScreeningOutput

logger = structlog.get_logger()

SYSTEM_PROMPT = """\
You are an expert senior recruiter with deep experience in talent acquisition.
Your task is to evaluate a candidate's CV against the job requirements and produce
a structured screening assessment.

## Scoring Criteria (each scored 0–20, total 100)

1. **Skills Match** – How well the candidate's technical and functional skills
   align with the job requirements.
2. **Experience Relevance** – How relevant the candidate's past roles and
   accomplishments are to this position.
3. **Education & Certifications** – Whether the candidate's educational
   background and certifications meet or exceed expectations.
4. **Cultural & Soft Skills Fit** – Evidence of teamwork, communication,
   leadership, and alignment with typical organisational values.
5. **Overall Impression** – Resume quality, career trajectory, and any
   stand-out factors (or red flags).

## Recommendation Thresholds

- **shortlist**: total score >= 70
- **review**: total score 40–69
- **reject**: total score < 40

## Output Format

Return ONLY valid JSON (no markdown fences, no extra text) with this structure:

{
  "score": <number 0-100>,
  "recommendation": "shortlist" | "review" | "reject",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "score_breakdown": [
    {
      "criteria": "<criteria name>",
      "score": <number 0-20>,
      "max_score": 20,
      "reason": "<brief justification>"
    }
  ]
}

All five criteria MUST appear in score_breakdown. Be objective, fair, and concise.\
"""

USER_PROMPT_TEMPLATE = """\
## Job Details

**Title:** {job_title}

**Description:**
{job_description}

**Requirements:**
{job_requirements}

---

## Candidate CV

{cv_text}\
"""

OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"
REQUEST_TIMEOUT_SECONDS = 120.0


class OpenAIEngine(AIEngine):
    """AI engine backed by the OpenAI Chat Completions API.

    Uses ``httpx`` directly to avoid pulling in the heavyweight ``openai`` SDK.
    """

    def __init__(self, api_key: str, model: str = "gpt-4o") -> None:
        self._api_key = api_key
        self._model = model

    async def screen_cv(self, screening_input: ScreeningInput) -> ScreeningOutput:
        user_message = USER_PROMPT_TEMPLATE.format(
            job_title=screening_input.job_title,
            job_description=screening_input.job_description,
            job_requirements=screening_input.job_requirements,
            cv_text=screening_input.cv_text,
        )

        payload = {
            "model": self._model,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            "response_format": {"type": "json_object"},
        }

        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        log = logger.bind(model=self._model)
        log.info("ai.openai.request_started")

        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            response = await client.post(
                OPENAI_CHAT_URL,
                json=payload,
                headers=headers,
            )

        if response.status_code != 200:  # noqa: PLR2004
            body = response.text
            log.error(
                "ai.openai.request_failed",
                status=response.status_code,
                body=body[:500],
            )
            msg = f"OpenAI API returned {response.status_code}: {body[:200]}"
            raise RuntimeError(msg)

        data = response.json()
        content = data["choices"][0]["message"]["content"]

        log.info("ai.openai.response_received", tokens=data.get("usage"))

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as exc:
            log.error("ai.openai.invalid_json", content=content[:500])
            msg = "AI returned invalid JSON"
            raise RuntimeError(msg) from exc

        return ScreeningOutput.model_validate(parsed)
