from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from supabase import create_client, Client
from config import settings

bearer_scheme = HTTPBearer(auto_error=False)


def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_key)


def _decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.supabase_anon_key,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    supabase: Client = Depends(get_supabase),
) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify token with Supabase
    try:
        user_res = supabase.auth.get_user(credentials.credentials)
        user = user_res.user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": user.id, "email": user.email}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


async def get_admin_user(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> dict:
    res = supabase.table("user_roles").select("role").eq("user_id", current_user["id"]).single().execute()
    if not res.data or res.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
