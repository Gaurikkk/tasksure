from datetime import datetime, timedelta, timezone
from typing import Optional
import hashlib
import base64
from io import BytesIO
import os

from jose import JWTError, jwt
from PIL import Image

from openai import OpenAI


# ================= JWT CONFIG ==================
SECRET_KEY = "super-secret-key-change-this-later"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


# ================= PASSWORD HASHING ==================
def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return get_password_hash(plain_password) == hashed_password


# ================= JWT HELPERS ==================
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ================= OPENAI CLIENT ==================
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ================= AI IMAGE VERIFICATION ==================
def verify_proof_image(file_bytes):

    # ---- 1️⃣ BASIC VALIDATION ----
    try:
        img = Image.open(BytesIO(file_bytes))
        img.verify()
    except Exception:
        return False, "Invalid or corrupted image."

    # ---- 2️⃣ CONVERT TO BASE64 FOR AI ----
    encoded = base64.b64encode(file_bytes).decode("utf-8")

    # ---- 3️⃣ REAL AI ANALYSIS ----
    try:
        result = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an AI vision system used to verify proof images. "
                        "Your job is to confirm if the image appears to show real task completion. "
                        "Be strict. Reject fake, random, blank, unrelated images."
                    )
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Does this image look like real proof of work? Respond true/false + explanation."},
                        {
                            "type": "image_url",
                            "image_url": f"data:image/jpeg;base64,{encoded}"
                        }
                    ]
                }
            ]
        )

        ai_text = result.choices[0].message.content.lower()

        if "true" in ai_text or "valid" in ai_text or "proof" in ai_text:
            return True, ai_text

        return False, ai_text

    except Exception as e:
        return False, f"AI error: {str(e)}"
