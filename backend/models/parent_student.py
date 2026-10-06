from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint

from database import Base


class ParentStudent(Base):
    __tablename__ = "parent_students"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    parent_id = Column(
        Integer,
        ForeignKey(
            "parents.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    student_id = Column(
        Integer,
        ForeignKey(
            "students.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    relationship = Column(
        String(50),
        nullable=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="ACTIVE",
    )

    __table_args__ = (
        UniqueConstraint(
            "parent_id",
            "student_id",
            name="uq_parent_student",
        ),
    )