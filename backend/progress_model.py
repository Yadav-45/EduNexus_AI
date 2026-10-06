from sqlalchemy import Column, Integer, Boolean
from database import Base


class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, nullable=False)
    lesson_number = Column(Integer, nullable=False)
    lesson_completed = Column(Boolean, default=False)