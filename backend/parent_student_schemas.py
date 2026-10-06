from pydantic import BaseModel, ConfigDict


class ParentStudentCreate(BaseModel):
    parent_id: int
    student_id: int
    relationship: str | None = None
    status: str = "ACTIVE"


class ParentStudentResponse(BaseModel):
    id: int
    parent_id: int
    student_id: int
    relationship: str | None
    status: str

    model_config = ConfigDict(
        from_attributes=True,
    )