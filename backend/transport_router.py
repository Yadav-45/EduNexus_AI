from datetime import date
from decimal import Decimal
from importlib import import_module

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from models.student import Student
from models.transport_driver import TransportDriver
from models.transport_route import TransportRoute
from models.transport_vehicle import TransportVehicle

StudentTransport = import_module("models.student_transport").StudentTransport

from transport_schemas import (
    DRIVER_STATUSES,
    ROUTE_STATUSES,
    STUDENT_TRANSPORT_STATUSES,
    VEHICLE_STATUSES,
    StudentTransportCreate,
    StudentTransportResponse,
    StudentTransportUpdate,
    TransportDashboardResponse,
    TransportDriverCreate,
    TransportDriverResponse,
    TransportDriverUpdate,
    TransportRouteCreate,
    TransportRouteResponse,
    TransportRouteUpdate,
    TransportVehicleCreate,
    TransportVehicleResponse,
    TransportVehicleUpdate,
)


router = APIRouter(
    prefix="/transport",
    tags=["Transport Management"],
)


ALLOWED_ROLES = (
    "OWNER",
    "ADMIN",
    "ACCOUNTANT",
)


# ============================================================
# HELPERS
# ============================================================

def validate_status(
    value: str,
    allowed: set[str],
    field_name: str,
):
    value = value.upper()

    if value not in allowed:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid {field_name}. "
                f"Allowed values: {', '.join(sorted(allowed))}"
            ),
        )

    return value


def validate_vehicle_exists(
    db: Session,
    vehicle_id: int,
):
    vehicle = (
        db.query(TransportVehicle)
        .filter(
            TransportVehicle.id == vehicle_id,
            TransportVehicle.is_active.is_(True),
        )
        .first()
    )

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found.",
        )

    return vehicle


def validate_driver_exists(
    db: Session,
    driver_id: int,
):
    driver = (
        db.query(TransportDriver)
        .filter(
            TransportDriver.id == driver_id,
            TransportDriver.is_active.is_(True),
        )
        .first()
    )

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver not found.",
        )

    return driver


def validate_route_exists(
    db: Session,
    route_id: int,
):
    route = (
        db.query(TransportRoute)
        .filter(
            TransportRoute.id == route_id,
            TransportRoute.is_active.is_(True),
        )
        .first()
    )

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Transport route not found.",
        )

    return route


def validate_student_exists(
    db: Session,
    student_id: int,
):
    student = (
        db.query(Student)
        .filter(
            Student.id == student_id,
        )
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    return student


# ============================================================
# DASHBOARD
# ============================================================

@router.get(
    "/dashboard",
    response_model=TransportDashboardResponse,
)
def get_transport_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    total_vehicles = (
        db.query(func.count(TransportVehicle.id))
        .filter(
            TransportVehicle.is_active.is_(True)
        )
        .scalar()
        or 0
    )

    active_vehicles = (
        db.query(func.count(TransportVehicle.id))
        .filter(
            TransportVehicle.is_active.is_(True),
            TransportVehicle.status == "ACTIVE",
        )
        .scalar()
        or 0
    )

    maintenance_vehicles = (
        db.query(func.count(TransportVehicle.id))
        .filter(
            TransportVehicle.is_active.is_(True),
            TransportVehicle.status == "MAINTENANCE",
        )
        .scalar()
        or 0
    )

    total_drivers = (
        db.query(func.count(TransportDriver.id))
        .filter(
            TransportDriver.is_active.is_(True)
        )
        .scalar()
        or 0
    )

    active_drivers = (
        db.query(func.count(TransportDriver.id))
        .filter(
            TransportDriver.is_active.is_(True),
            TransportDriver.status == "ACTIVE",
        )
        .scalar()
        or 0
    )

    total_routes = (
        db.query(func.count(TransportRoute.id))
        .filter(
            TransportRoute.is_active.is_(True)
        )
        .scalar()
        or 0
    )

    active_routes = (
        db.query(func.count(TransportRoute.id))
        .filter(
            TransportRoute.is_active.is_(True),
            TransportRoute.status == "ACTIVE",
        )
        .scalar()
        or 0
    )

    total_students = (
        db.query(func.count(StudentTransport.id))
        .filter(
            StudentTransport.is_active.is_(True)
        )
        .scalar()
        or 0
    )

    active_students = (
        db.query(func.count(StudentTransport.id))
        .filter(
            StudentTransport.is_active.is_(True),
            StudentTransport.status == "ACTIVE",
        )
        .scalar()
        or 0
    )

    return TransportDashboardResponse(
        total_vehicles=total_vehicles,
        active_vehicles=active_vehicles,
        maintenance_vehicles=maintenance_vehicles,
        total_drivers=total_drivers,
        active_drivers=active_drivers,
        total_routes=total_routes,
        active_routes=active_routes,
        total_students=total_students,
        active_students=active_students,
    )


# ============================================================
# VEHICLES
# ============================================================

@router.post(
    "/vehicles",
    response_model=TransportVehicleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_vehicle(
    data: TransportVehicleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    vehicle_number = data.vehicle_number.strip().upper()

    existing = (
        db.query(TransportVehicle)
        .filter(
            TransportVehicle.vehicle_number == vehicle_number
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Vehicle number already exists.",
        )

    if data.registration_number:
        existing_registration = (
            db.query(TransportVehicle)
            .filter(
                TransportVehicle.registration_number
                == data.registration_number.strip().upper()
            )
            .first()
        )

        if existing_registration:
            raise HTTPException(
                status_code=400,
                detail="Registration number already exists.",
            )

    vehicle_status = validate_status(
        data.status,
        VEHICLE_STATUSES,
        "vehicle status",
    )

    vehicle = TransportVehicle(
        vehicle_number=vehicle_number,
        vehicle_type=data.vehicle_type.strip(),
        make_model=(
            data.make_model.strip()
            if data.make_model
            else None
        ),
        capacity=data.capacity,
        registration_number=(
            data.registration_number.strip().upper()
            if data.registration_number
            else None
        ),
        registration_expiry=data.registration_expiry,
        insurance_number=(
            data.insurance_number.strip()
            if data.insurance_number
            else None
        ),
        insurance_expiry=data.insurance_expiry,
        status=vehicle_status,
        notes=data.notes,
        is_active=True,
    )

    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)

    return vehicle


@router.get(
    "/vehicles",
    response_model=list[TransportVehicleResponse],
)
def list_vehicles(
    page: int = Query(1, ge=1),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
    search: str | None = None,
    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),
    include_archived: bool = False,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    query = db.query(TransportVehicle)

    if not include_archived:
        query = query.filter(
            TransportVehicle.is_active.is_(True)
        )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                TransportVehicle.vehicle_number.ilike(
                    search_value
                ),
                TransportVehicle.vehicle_type.ilike(
                    search_value
                ),
                TransportVehicle.make_model.ilike(
                    search_value
                ),
                TransportVehicle.registration_number.ilike(
                    search_value
                ),
            )
        )

    if status_filter:
        validate_status(
            status_filter,
            VEHICLE_STATUSES,
            "vehicle status",
        )

        query = query.filter(
            TransportVehicle.status
            == status_filter.upper()
        )

    return (
        query
        .order_by(TransportVehicle.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )


@router.get(
    "/vehicles/{vehicle_id}",
    response_model=TransportVehicleResponse,
)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    vehicle = (
        db.query(TransportVehicle)
        .filter(
            TransportVehicle.id == vehicle_id
        )
        .first()
    )

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found.",
        )

    return vehicle


@router.put(
    "/vehicles/{vehicle_id}",
    response_model=TransportVehicleResponse,
)
def update_vehicle(
    vehicle_id: int,
    data: TransportVehicleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    vehicle = (
        db.query(TransportVehicle)
        .filter(
            TransportVehicle.id == vehicle_id
        )
        .first()
    )

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found.",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "vehicle_number" in update_data:
        new_number = (
            update_data["vehicle_number"]
            .strip()
            .upper()
        )

        duplicate = (
            db.query(TransportVehicle)
            .filter(
                TransportVehicle.vehicle_number
                == new_number,
                TransportVehicle.id != vehicle_id,
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Vehicle number already exists.",
            )

        update_data["vehicle_number"] = new_number

    if "registration_number" in update_data:
        if update_data["registration_number"]:
            new_registration = (
                update_data["registration_number"]
                .strip()
                .upper()
            )

            duplicate = (
                db.query(TransportVehicle)
                .filter(
                    TransportVehicle.registration_number
                    == new_registration,
                    TransportVehicle.id != vehicle_id,
                )
                .first()
            )

            if duplicate:
                raise HTTPException(
                    status_code=400,
                    detail="Registration number already exists.",
                )

            update_data["registration_number"] = (
                new_registration
            )

    if "status" in update_data:
        update_data["status"] = validate_status(
            update_data["status"],
            VEHICLE_STATUSES,
            "vehicle status",
        )

    for field, value in update_data.items():
        setattr(vehicle, field, value)

    db.commit()
    db.refresh(vehicle)

    return vehicle


@router.delete(
    "/vehicles/{vehicle_id}",
)
def archive_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    vehicle = (
        db.query(TransportVehicle)
        .filter(
            TransportVehicle.id == vehicle_id
        )
        .first()
    )

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found.",
        )

    vehicle.is_active = False
    vehicle.status = "INACTIVE"

    db.commit()

    return {
        "message": "Vehicle archived successfully."
    }


@router.patch(
    "/vehicles/{vehicle_id}/restore",
)
def restore_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    vehicle = (
        db.query(TransportVehicle)
        .filter(
            TransportVehicle.id == vehicle_id
        )
        .first()
    )

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found.",
        )

    vehicle.is_active = True
    vehicle.status = "ACTIVE"

    db.commit()

    return {
        "message": "Vehicle restored successfully."
    }


# ============================================================
# DRIVERS
# ============================================================

@router.post(
    "/drivers",
    response_model=TransportDriverResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_driver(
    data: TransportDriverCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    license_number = data.license_number.strip().upper()

    existing = (
        db.query(TransportDriver)
        .filter(
            TransportDriver.license_number
            == license_number
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="License number already exists.",
        )

    driver_status = validate_status(
        data.status,
        DRIVER_STATUSES,
        "driver status",
    )

    driver = TransportDriver(
        full_name=data.full_name.strip(),
        phone=data.phone.strip(),
        alternate_phone=(
            data.alternate_phone.strip()
            if data.alternate_phone
            else None
        ),
        license_number=license_number,
        license_type=(
            data.license_type.strip()
            if data.license_type
            else None
        ),
        license_expiry=data.license_expiry,
        address=data.address,
        status=driver_status,
        notes=data.notes,
        is_active=True,
    )

    db.add(driver)
    db.commit()
    db.refresh(driver)

    return driver


@router.get(
    "/drivers",
    response_model=list[TransportDriverResponse],
)
def list_drivers(
    page: int = Query(1, ge=1),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
    search: str | None = None,
    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),
    include_archived: bool = False,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    query = db.query(TransportDriver)

    if not include_archived:
        query = query.filter(
            TransportDriver.is_active.is_(True)
        )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                TransportDriver.full_name.ilike(
                    search_value
                ),
                TransportDriver.phone.ilike(
                    search_value
                ),
                TransportDriver.license_number.ilike(
                    search_value
                ),
            )
        )

    if status_filter:
        validate_status(
            status_filter,
            DRIVER_STATUSES,
            "driver status",
        )

        query = query.filter(
            TransportDriver.status
            == status_filter.upper()
        )

    return (
        query
        .order_by(TransportDriver.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )


@router.get(
    "/drivers/{driver_id}",
    response_model=TransportDriverResponse,
)
def get_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    driver = (
        db.query(TransportDriver)
        .filter(
            TransportDriver.id == driver_id
        )
        .first()
    )

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver not found.",
        )

    return driver


@router.put(
    "/drivers/{driver_id}",
    response_model=TransportDriverResponse,
)
def update_driver(
    driver_id: int,
    data: TransportDriverUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    driver = (
        db.query(TransportDriver)
        .filter(
            TransportDriver.id == driver_id
        )
        .first()
    )

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver not found.",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "license_number" in update_data:
        new_license = (
            update_data["license_number"]
            .strip()
            .upper()
        )

        duplicate = (
            db.query(TransportDriver)
            .filter(
                TransportDriver.license_number
                == new_license,
                TransportDriver.id != driver_id,
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="License number already exists.",
            )

        update_data["license_number"] = new_license

    if "status" in update_data:
        update_data["status"] = validate_status(
            update_data["status"],
            DRIVER_STATUSES,
            "driver status",
        )

    for field, value in update_data.items():
        setattr(driver, field, value)

    db.commit()
    db.refresh(driver)

    return driver


@router.delete(
    "/drivers/{driver_id}",
)
def archive_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    driver = (
        db.query(TransportDriver)
        .filter(
            TransportDriver.id == driver_id
        )
        .first()
    )

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver not found.",
        )

    driver.is_active = False
    driver.status = "INACTIVE"

    db.commit()

    return {
        "message": "Driver archived successfully."
    }


@router.patch(
    "/drivers/{driver_id}/restore",
)
def restore_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    driver = (
        db.query(TransportDriver)
        .filter(
            TransportDriver.id == driver_id
        )
        .first()
    )

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver not found.",
        )

    driver.is_active = True
    driver.status = "ACTIVE"

    db.commit()

    return {
        "message": "Driver restored successfully."
    }


# ============================================================
# ROUTES
# ============================================================

@router.post(
    "/routes",
    response_model=TransportRouteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_route(
    data: TransportRouteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    route_code = data.route_code.strip().upper()

    existing = (
        db.query(TransportRoute)
        .filter(
            TransportRoute.route_code == route_code
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Route code already exists.",
        )

    if data.vehicle_id is not None:
        validate_vehicle_exists(
            db,
            data.vehicle_id,
        )

    if data.driver_id is not None:
        validate_driver_exists(
            db,
            data.driver_id,
        )

    route_status = validate_status(
        data.status,
        ROUTE_STATUSES,
        "route status",
    )

    route = TransportRoute(
        route_name=data.route_name.strip(),
        route_code=route_code,
        description=data.description,
        start_point=data.start_point.strip(),
        end_point=data.end_point.strip(),
        pickup_points=data.pickup_points,
        distance_km=data.distance_km,
        estimated_duration_minutes=(
            data.estimated_duration_minutes
        ),
        vehicle_id=data.vehicle_id,
        driver_id=data.driver_id,
        status=route_status,
        is_active=True,
        notes=data.notes,
    )

    db.add(route)
    db.commit()
    db.refresh(route)

    return route


@router.get(
    "/routes",
    response_model=list[TransportRouteResponse],
)
def list_routes(
    page: int = Query(1, ge=1),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
    search: str | None = None,
    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),
    include_archived: bool = False,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    query = db.query(TransportRoute)

    if not include_archived:
        query = query.filter(
            TransportRoute.is_active.is_(True)
        )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                TransportRoute.route_name.ilike(
                    search_value
                ),
                TransportRoute.route_code.ilike(
                    search_value
                ),
                TransportRoute.start_point.ilike(
                    search_value
                ),
                TransportRoute.end_point.ilike(
                    search_value
                ),
            )
        )

    if status_filter:
        validate_status(
            status_filter,
            ROUTE_STATUSES,
            "route status",
        )

        query = query.filter(
            TransportRoute.status
            == status_filter.upper()
        )

    return (
        query
        .order_by(TransportRoute.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )


@router.get(
    "/routes/{route_id}",
    response_model=TransportRouteResponse,
)
def get_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    route = (
        db.query(TransportRoute)
        .filter(
            TransportRoute.id == route_id
        )
        .first()
    )

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Transport route not found.",
        )

    return route


@router.put(
    "/routes/{route_id}",
    response_model=TransportRouteResponse,
)
def update_route(
    route_id: int,
    data: TransportRouteUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    route = (
        db.query(TransportRoute)
        .filter(
            TransportRoute.id == route_id
        )
        .first()
    )

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Transport route not found.",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "route_code" in update_data:
        new_code = (
            update_data["route_code"]
            .strip()
            .upper()
        )

        duplicate = (
            db.query(TransportRoute)
            .filter(
                TransportRoute.route_code == new_code,
                TransportRoute.id != route_id,
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Route code already exists.",
            )

        update_data["route_code"] = new_code

    if "vehicle_id" in update_data:
        if update_data["vehicle_id"] is not None:
            validate_vehicle_exists(
                db,
                update_data["vehicle_id"],
            )

    if "driver_id" in update_data:
        if update_data["driver_id"] is not None:
            validate_driver_exists(
                db,
                update_data["driver_id"],
            )

    if "status" in update_data:
        update_data["status"] = validate_status(
            update_data["status"],
            ROUTE_STATUSES,
            "route status",
        )

    for field, value in update_data.items():
        setattr(route, field, value)

    db.commit()
    db.refresh(route)

    return route


@router.delete(
    "/routes/{route_id}",
)
def archive_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    route = (
        db.query(TransportRoute)
        .filter(
            TransportRoute.id == route_id
        )
        .first()
    )

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Transport route not found.",
        )

    route.is_active = False
    route.status = "INACTIVE"

    db.commit()

    return {
        "message": "Transport route archived successfully."
    }


@router.patch(
    "/routes/{route_id}/restore",
)
def restore_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    route = (
        db.query(TransportRoute)
        .filter(
            TransportRoute.id == route_id
        )
        .first()
    )

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Transport route not found.",
        )

    route.is_active = True
    route.status = "ACTIVE"

    db.commit()

    return {
        "message": "Transport route restored successfully."
    }


# ============================================================
# STUDENT TRANSPORT
# ============================================================

@router.post(
    "/students",
    response_model=StudentTransportResponse,
    status_code=status.HTTP_201_CREATED,
)
def assign_student_transport(
    data: StudentTransportCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    validate_student_exists(
        db,
        data.student_id,
    )

    validate_route_exists(
        db,
        data.route_id,
    )

    transport_status = validate_status(
        data.status,
        STUDENT_TRANSPORT_STATUSES,
        "student transport status",
    )

    existing = (
        db.query(StudentTransport)
        .filter(
            StudentTransport.student_id
            == data.student_id,
            StudentTransport.is_active.is_(True),
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail=(
                "This student already has an active "
                "transport assignment."
            ),
        )

    student_transport = StudentTransport(
        student_id=data.student_id,
        route_id=data.route_id,
        pickup_point=data.pickup_point,
        drop_point=data.drop_point,
        transport_fee=(
            str(data.transport_fee)
            if data.transport_fee is not None
            else None
        ),
        start_date=data.start_date,
        end_date=data.end_date,
        status=transport_status,
        is_active=True,
        notes=data.notes,
    )

    db.add(student_transport)
    db.commit()
    db.refresh(student_transport)

    return student_transport


@router.get(
    "/students",
    response_model=list[StudentTransportResponse],
)
def list_student_transport(
    page: int = Query(1, ge=1),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
    student_id: int | None = None,
    route_id: int | None = None,
    search: str | None = None,
    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),
    include_archived: bool = False,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    query = (
        db.query(StudentTransport)
        .join(
            Student,
            Student.id
            == StudentTransport.student_id,
        )
    )

    if not include_archived:
        query = query.filter(
            StudentTransport.is_active.is_(True)
        )

    if student_id is not None:
        query = query.filter(
            StudentTransport.student_id == student_id
        )

    if route_id is not None:
        query = query.filter(
            StudentTransport.route_id == route_id
        )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                Student.first_name.ilike(
                    search_value
                ),
                Student.last_name.ilike(
                    search_value
                ),
                Student.admission_number.ilike(
                    search_value
                ),
                StudentTransport.pickup_point.ilike(
                    search_value
                ),
                StudentTransport.drop_point.ilike(
                    search_value
                ),
            )
        )

    if status_filter:
        validate_status(
            status_filter,
            STUDENT_TRANSPORT_STATUSES,
            "student transport status",
        )

        query = query.filter(
            StudentTransport.status
            == status_filter.upper()
        )

    return (
        query
        .order_by(StudentTransport.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )


@router.get(
    "/students/{assignment_id}",
    response_model=StudentTransportResponse,
)
def get_student_transport(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    assignment = (
        db.query(StudentTransport)
        .filter(
            StudentTransport.id == assignment_id
        )
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Student transport assignment not found.",
        )

    return assignment


@router.put(
    "/students/{assignment_id}",
    response_model=StudentTransportResponse,
)
def update_student_transport(
    assignment_id: int,
    data: StudentTransportUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    assignment = (
        db.query(StudentTransport)
        .filter(
            StudentTransport.id == assignment_id
        )
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Student transport assignment not found.",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "route_id" in update_data:
        if update_data["route_id"] is not None:
            validate_route_exists(
                db,
                update_data["route_id"],
            )

    if "transport_fee" in update_data:
        update_data["transport_fee"] = (
            str(update_data["transport_fee"])
            if update_data["transport_fee"] is not None
            else None
        )

    if "status" in update_data:
        update_data["status"] = validate_status(
            update_data["status"],
            STUDENT_TRANSPORT_STATUSES,
            "student transport status",
        )

    for field, value in update_data.items():
        setattr(assignment, field, value)

    db.commit()
    db.refresh(assignment)

    return assignment


@router.delete(
    "/students/{assignment_id}",
)
def archive_student_transport(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    assignment = (
        db.query(StudentTransport)
        .filter(
            StudentTransport.id == assignment_id
        )
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Student transport assignment not found.",
        )

    assignment.is_active = False
    assignment.status = "INACTIVE"

    db.commit()

    return {
        "message": (
            "Student transport assignment "
            "archived successfully."
        )
    }


@router.patch(
    "/students/{assignment_id}/restore",
)
def restore_student_transport(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(*ALLOWED_ROLES)
    ),
):
    assignment = (
        db.query(StudentTransport)
        .filter(
            StudentTransport.id == assignment_id
        )
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Student transport assignment not found.",
        )

    assignment.is_active = True
    assignment.status = "ACTIVE"

    db.commit()

    return {
        "message": (
            "Student transport assignment "
            "restored successfully."
        )
    }