from database import SessionLocal
from models.user import User
from auth.security import hash_password


OWNER_NAME = "School Owner"
OWNER_EMAIL = "owner@edunexus.com"
OWNER_PASSWORD = "Owner@12345"


def create_owner():
    db = SessionLocal()

    try:
        existing_owner = (
            db.query(User)
            .filter(User.role == "OWNER")
            .first()
        )

        if existing_owner:
            print(
                f"An OWNER account already exists: "
                f"{existing_owner.email}"
            )
            return

        existing_email = (
            db.query(User)
            .filter(User.email == OWNER_EMAIL)
            .first()
        )

        if existing_email:
            print(
                f"The email {OWNER_EMAIL} is already "
                f"being used by another account."
            )
            return

        owner = User(
            full_name=OWNER_NAME,
            email=OWNER_EMAIL,
            password_hash=hash_password(
                OWNER_PASSWORD
            ),
            role="OWNER",
            is_active=True,
        )

        db.add(owner)
        db.commit()
        db.refresh(owner)

        print("")
        print("OWNER ACCOUNT CREATED")
        print("---------------------")
        print(f"Name:     {owner.full_name}")
        print(f"Email:    {owner.email}")
        print(f"Password: {OWNER_PASSWORD}")
        print(f"Role:     {owner.role}")
        print(f"Active:   {owner.is_active}")
        print("")

    finally:
        db.close()


if __name__ == "__main__":
    create_owner()