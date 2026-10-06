from sqlalchemy import Column, Integer, String, Text

from database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    title = Column(
        String(150),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    instructor = Column(
        String(150),
        nullable=True,
    )

    category = Column(
        String(100),
        nullable=True,
    )

    image_url = Column(
        String(500),
        nullable=True,
    )