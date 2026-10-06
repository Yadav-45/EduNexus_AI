from sqlalchemy import Column, Integer, String, Text, Boolean
from database import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(String(50), nullable=True)
    completed = Column(Boolean, default=False)