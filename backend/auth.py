from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime, timedelta
import hashlib
from models import Users
from db import get_db

SECRET_KEY = "SUPER_SECRET_KEY_CHANGE_THIS"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme),db:Session=Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id=payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=401 , detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user=db.query(Users).filter(Users.id==user_id).first()

    if not user:
        raise HTTPException(status_code=401,detail="User not found")

    return user

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def hash_password(password:str):
    return hashlib.sha256(password.encode()).hexdigest()

def role_required(required_role:list):
    def role_checker(current_user:Users=Depends(get_current_user)):
        if current_user.role not in required_role:
            raise HTTPException(status_code=403,detail=f"Only {','.join(required_role)} can access.")
        return current_user
    return role_checker