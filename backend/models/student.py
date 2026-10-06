from sqlalchemy import Column, Date, ForeignKey, Integer, String, Text
from database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=True,
    )

    admission_number = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    first_name = Column(
        String(100),
        nullable=False,
    )

    last_name = Column(
        String(100),
        nullable=True,
    )

    date_of_birth = Column(
        Date,
        nullable=True,
    )

    gender = Column(
        String(20),
        nullable=True,
    )

    phone = Column(
        String(30),
        nullable=True,
    )

    address = Column(
        Text,
        nullable=True,
    )

    class_name = Column(
        String(100),
        nullable=True,
    )

    section = Column(
        String(50),
        nullable=True,
    )

    academic_year = Column(
        String(20),
        nullable=True,
    )

    admission_date = Column(
        Date,
        nullable=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="ACTIVE",
    )