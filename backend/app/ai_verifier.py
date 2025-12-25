import os
import base64
from pathlib import Path
from typing import Optional, Tuple
from dotenv import load_dotenv
from openai import OpenAI

# Load .env and initialize
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def ai_verify_proof(
    proof_text: Optional[str],
    proof_path: Optional[str],
    task_title: Optional[str] = None,
    task_description: Optional[str] = None
) -> Tuple[bool, str]:
    """
    Uses OpenAI to verify proof text + optional image.
    Returns: (approved: bool, feedback: str)
    """

    # -------------------------------------------------------------
    #  CASE: No OpenAI Key
    # -------------------------------------------------------------
    if not client.api_key:
        print("⚠ WARNING: No OPENAI_API_KEY found → auto-rejecting.")
        return False, "AI key missing. Proof rejected."


    # -------------------------------------------------------------
    #  CASE: TEXT-ONLY PROOF
    # -------------------------------------------------------------
    if not proof_path or not Path(proof_path).exists():
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You verify if text proves task completion. "
                            "Respond EXACTLY like this:\n"
                            "DECISION||REASON\n"
                            "DECISION = APPROVE or REJECT\n"
                            "REASON = max 1–2 short sentences."
                        )
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Task title: {task_title or 'N/A'}\n"
                            f"Task description: {task_description or 'N/A'}\n"
                            f"User text proof: {proof_text or 'None'}\n\n"
                            "Does this text prove the task was done?"
                        )
                    },
                ],
                max_tokens=100
            )

            text = response.choices[0].message.content.strip()
            decision, _, reason = text.partition("||")

            approved = decision.strip().lower() == "approve"
            reason = reason.strip() or "No reason provided."

            return approved, reason

        except Exception as e:
            print("AI text error →", e)
            return False, "AI verification failed."


    # -------------------------------------------------------------
    #  CASE: TEXT + IMAGE PROOF
    # -------------------------------------------------------------
    try:
        # Convert binary → base64 image
        with open(proof_path, "rb") as f:
            raw_bytes = f.read()

        img_base64 = base64.b64encode(raw_bytes).decode("utf-8")

        # AI call
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You verify task proof using text + image. "
                        "Respond EXACTLY:\n"
                        "DECISION||REASON\n"
                        "DECISION = APPROVE or REJECT\n"
                        "REASON = max 1–2 short sentences."
                    )
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                f"Task title: {task_title or 'N/A'}\n"
                                f"Task description: {task_description or 'N/A'}\n"
                                f"User text proof: {proof_text or 'None'}\n\n"
                                "Does this image prove the task was done?"
                            ),
                        },
                        {
                            "type": "input_image",
                            "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}
                        }
                    ]
                },
            ],
            max_tokens=200
        )

        text = response.choices[0].message.content.strip()
        decision, _, reason = text.partition("||")

        approved = decision.strip().lower() == "approve"
        reason = reason.strip() or "No reason provided."

        return approved, reason

    except Exception as e:
        print("AI image error →", e)
        return False, "AI image verification failed."
