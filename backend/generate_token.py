import jwt
from datetime import datetime, timedelta

# Configuration (should match the backend)
SECRET_KEY = "your-secret-key-here"  # Same as in todo_backend.py
ALGORITHM = "HS256"

def create_test_token(user_id: str):
    """Create a test JWT token for the given user_id"""
    to_encode = {"sub": user_id}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Example usage
if __name__ == "__main__":
    user_id = "testuser123"
    token = create_test_token(user_id)
    print(f"User ID: {user_id}")
    print(f"Token: {token}")
    print(f"Authorization header: Authorization: Bearer {token}")