from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# CONSTANTS
# ============================================================

VEHICLE_STATUSES = {
    "ACTIVE",
    "MAINTENANCE",
    "INACTIVE",
    "RETIRED",
}

DRIVER_STATUSES = {
    "ACTIVE",
    "INACTIVE",
    "SUSPENDED",
}

ROUTE_STATUSES = {
    "ACTIVE",
    "INACTIVE",
}

STUDENT_TRANSPORT_STATUSES = {
    "ACTIVE",
    "INACTIVE",
}


# ============================================================
# VEHICLE
# ============================================================

class TransportVehicleCreate(BaseModel):
    vehicle_number: str = Field(
        min_length=2,
        max_length=50,
    )

    vehicle_type: str = Field(
        min_length=2,
        max_length=50,
    )

    make_model: str | None = Field(
        default=None,
        max_length=150,
    )

    capacity: int = Field(
        gt=0,
        le=500,
    )

    registration_number: str | None = Field(
        default=None,
        max_length=100,
    )

    registration_expiry: date | None = None

    insurance_number: str | None = Field(
        default=None,
        max_length=100,
    )

    insurance_expiry: date | None = None

    status: str = "ACTIVE"

    notes: str | None = None


class TransportVehicleUpdate(BaseModel):
    vehicle_number: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
    )

    vehicle_type: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
    )

    make_model: str | None = Field(
        default=None,
        max_length=150,
    )

    capacity: int | None = Field(
        default=None,
        gt=0,
        le=500,
    )

    registration_number: str | None = Field(
        default=None,
        max_length=100,
    )

    registration_expiry: date | None = None

    insurance_number: str | None = Field(
        default=None,
        max_length=100,
    )

    insurance_expiry: date | None = None

    status: str | None = None

    notes: str | None = None


class TransportVehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_number: str
    vehicle_type: str
    make_model: str | None
    capacity: int
    registration_number: str | None
    registration_expiry: date | None
    insurance_number: str | None
    insurance_expiry: date | None
    status: str
    notes: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ============================================================
# DRIVER
# ============================================================

class TransportDriverCreate(BaseModel):
    full_name: str = Field(
        min_length=2,
        max_length=200,
    )

    phone: str = Field(
        min_length=5,
        max_length=30,
    )

    alternate_phone: str | None = Field(
        default=None,
        max_length=30,
    )

    license_number: str = Field(
        min_length=2,
        max_length=100,
    )

    license_type: str | None = Field(
        default=None,
        max_length=50,
    )

    license_expiry: date | None = None

    address: str | None = None

    status: str = "ACTIVE"

    notes: str | None = None


class TransportDriverUpdate(BaseModel):
    full_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    phone: str | None = Field(
        default=None,
        min_length=5,
        max_length=30,
    )

    alternate_phone: str | None = Field(
        default=None,
        max_length=30,
    )

    license_number: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    license_type: str | None = Field(
        default=None,
        max_length=50,
    )

    license_expiry: date | None = None

    address: str | None = None

    status: str | None = None

    notes: str | None = None


class TransportDriverResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    phone: str
    alternate_phone: str | None
    license_number: str
    license_type: str | None
    license_expiry: date | None
    address: str | None
    status: str
    notes: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ============================================================
# ROUTE
# ============================================================

class TransportRouteCreate(BaseModel):
    route_name: str = Field(
        min_length=2,
        max_length=150,
    )

    route_code: str = Field(
        min_length=2,
        max_length=50,
    )

    description: str | None = None

    start_point: str = Field(
        min_length=2,
        max_length=200,
    )

    end_point: str = Field(
        min_length=2,
        max_length=200,
    )

    pickup_points: str | None = None

    distance_km: str | None = Field(
        default=None,
        max_length=30,
    )

    estimated_duration_minutes: int | None = Field(
        default=None,
        gt=0,
        le=1440,
    )

    vehicle_id: int | None = None

    driver_id: int | None = None

    status: str = "ACTIVE"

    notes: str | None = None


class TransportRouteUpdate(BaseModel):
    route_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    route_code: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
    )

    description: str | None = None

    start_point: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    end_point: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    pickup_points: str | None = None

    distance_km: str | None = Field(
        default=None,
        max_length=30,
    )

    estimated_duration_minutes: int | None = Field(
        default=None,
        gt=0,
        le=1440,
    )

    vehicle_id: int | None = None

    driver_id: int | None = None

    status: str | None = None

    notes: str | None = None


class TransportRouteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    route_name: str
    route_code: str
    description: str | None
    start_point: str
    end_point: str
    pickup_points: str | None
    distance_km: str | None
    estimated_duration_minutes: int | None
    vehicle_id: int | None
    driver_id: int | None
    status: str
    is_active: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime


# ============================================================
# STUDENT TRANSPORT
# ============================================================

class StudentTransportCreate(BaseModel):
    student_id: int
    route_id: int

    pickup_point: str | None = Field(
        default=None,
        max_length=200,
    )

    drop_point: str | None = Field(
        default=None,
        max_length=200,
    )

    transport_fee: Decimal | None = Field(
        default=None,
        ge=0,
    )

    start_date: datetime | None = None

    end_date: datetime | None = None

    status: str = "ACTIVE"

    notes: str | None = None


class StudentTransportUpdate(BaseModel):
    route_id: int | None = None

    pickup_point: str | None = Field(
        default=None,
        max_length=200,
    )

    drop_point: str | None = Field(
        default=None,
        max_length=200,
    )

    transport_fee: Decimal | None = Field(
        default=None,
        ge=0,
    )

    start_date: datetime | None = None

    end_date: datetime | None = None

    status: str | None = None

    notes: str | None = None


class StudentTransportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    route_id: int
    pickup_point: str | None
    drop_point: str | None
    transport_fee: str | None
    start_date: datetime | None
    end_date: datetime | None
    status: str
    is_active: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime


# ============================================================
# DASHBOARD
# ============================================================

class TransportDashboardResponse(BaseModel):
    total_vehicles: int
    active_vehicles: int
    maintenance_vehicles: int
    total_drivers: int
    active_drivers: int
    total_routes: int
    active_routes: int
    total_students: int
    active_students: int