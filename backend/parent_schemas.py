from pydantic import BaseModel, ConfigDict


class ParentCreate(BaseModel):
    first_name: str
    last_name: str | None = None
    relationship: str | None = None
    phone: str | None = None
    alternate_phone: str | None = None
    email: str | None = None
    address: str | None = None
    occupation: str | None = None
    status: str = "ACTIVE"


class ParentUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    relationship: str | None = None
    phone: str | None = None
    alternate_phone: str | None = None
    email: str | None = None
    address: str | None = None
    occupation: str | None = None
    status: str | None = None


class ParentResponse(BaseModel):
    id: int
    user_id: int | None
    first_name: str
    last_name: str | None
    relationship: str | None
    phone: str | None
    alternate_phone: str | None
    email: str | None
    address: str | None
    occupation: str | None
    status: str

    model_config = ConfigDict(
        from_attributes=True,
    )