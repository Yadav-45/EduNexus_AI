from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.fee_structure import FeeStructure
from auth.dependencies import require_roles

from fee_structure_schemas import (
    FeeStructureCreate,
    FeeStructureUpdate,
    FeeStructureResponse,
)

from core.query_params import SearchParams
from core.responses import (
    PaginatedResponse,
    PaginationMeta,
)


router = APIRouter(
    prefix="/fee-structures",
    tags=["Fee Management"],
)


def calculate_total_fee(
    request,
) -> object:
    return (
        request.admission_fee
        + request.tuition_fee
        + request.transport_fee
        + request.examination_fee
        + request.activity_fee
        + request.other_fee
    )


@router.post(
    "",
    response_model=FeeStructureResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_fee_structure(
    request: FeeStructureCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    existing = (
        db.query(FeeStructure)
        .filter(
            FeeStructure.academic_year
            == request.academic_year,
            FeeStructure.class_name
            == request.class_name,
            FeeStructure.name
            == request.name,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail=(
                "A fee structure with the same "
                "name, class, and academic year "
                "already exists."
            ),
        )

    total_fee = calculate_total_fee(request)

    fee_structure = FeeStructure(
        name=request.name,
        academic_year=request.academic_year,
        class_name=request.class_name,
        admission_fee=request.admission_fee,
        tuition_fee=request.tuition_fee,
        transport_fee=request.transport_fee,
        examination_fee=request.examination_fee,
        activity_fee=request.activity_fee,
        other_fee=request.other_fee,
        total_fee=total_fee,
        description=request.description,
        status="ACTIVE",
    )

    db.add(fee_structure)
    db.commit()
    db.refresh(fee_structure)

    return fee_structure


@router.get(
    "",
    response_model=PaginatedResponse[
        FeeStructureResponse
    ],
)
def get_fee_structures(
    params: SearchParams = Depends(),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    query = db.query(FeeStructure)

    if params.search:
        search_term = (
            f"%{params.search.strip()}%"
        )

        query = query.filter(
            (
                FeeStructure.name.ilike(
                    search_term
                )
                | FeeStructure.class_name.ilike(
                    search_term
                )
                | FeeStructure.academic_year.ilike(
                    search_term
                )
            )
        )

    if params.status:
        query = query.filter(
            FeeStructure.status
            == params.status
        )

    total = query.count()

    allowed_sort_fields = {
        "id": FeeStructure.id,
        "name": FeeStructure.name,
        "academic_year":
            FeeStructure.academic_year,
        "class_name":
            FeeStructure.class_name,
        "total_fee":
            FeeStructure.total_fee,
        "status":
            FeeStructure.status,
    }

    sort_column = allowed_sort_fields.get(
        params.sort_by,
        FeeStructure.id,
    )

    if params.sort_order == "desc":
        query = query.order_by(
            sort_column.desc()
        )
    else:
        query = query.order_by(
            sort_column.asc()
        )

    fee_structures = (
        query
        .offset(params.offset)
        .limit(params.page_size)
        .all()
    )

    total_pages = (
        (total + params.page_size - 1)
        // params.page_size
        if total > 0
        else 0
    )

    return PaginatedResponse(
        data=fee_structures,
        pagination=PaginationMeta(
            page=params.page,
            page_size=params.page_size,
            total=total,
            total_pages=total_pages,
        ),
    )


@router.get(
    "/{fee_structure_id}",
    response_model=FeeStructureResponse,
)
def get_fee_structure(
    fee_structure_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    fee_structure = (
        db.query(FeeStructure)
        .filter(
            FeeStructure.id
            == fee_structure_id
        )
        .first()
    )

    if not fee_structure:
        raise HTTPException(
            status_code=404,
            detail="Fee structure not found",
        )

    return fee_structure


@router.put(
    "/{fee_structure_id}",
    response_model=FeeStructureResponse,
)
def update_fee_structure(
    fee_structure_id: int,
    request: FeeStructureUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    fee_structure = (
        db.query(FeeStructure)
        .filter(
            FeeStructure.id
            == fee_structure_id
        )
        .first()
    )

    if not fee_structure:
        raise HTTPException(
            status_code=404,
            detail="Fee structure not found",
        )

    update_data = request.model_dump(
        exclude_unset=True
    )

    new_name = update_data.get(
        "name",
        fee_structure.name,
    )

    new_academic_year = update_data.get(
        "academic_year",
        fee_structure.academic_year,
    )

    new_class_name = update_data.get(
        "class_name",
        fee_structure.class_name,
    )

    duplicate = (
        db.query(FeeStructure)
        .filter(
            FeeStructure.name == new_name,
            FeeStructure.academic_year
            == new_academic_year,
            FeeStructure.class_name
            == new_class_name,
            FeeStructure.id
            != fee_structure_id,
        )
        .first()
    )

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail=(
                "A fee structure with the same "
                "name, class, and academic year "
                "already exists."
            ),
        )

    fee_fields = {
        "admission_fee",
        "tuition_fee",
        "transport_fee",
        "examination_fee",
        "activity_fee",
        "other_fee",
    }

    for field, value in update_data.items():
        if field not in fee_fields:
            setattr(
                fee_structure,
                field,
                value,
            )

    for field in fee_fields:
        if field in update_data:
            setattr(
                fee_structure,
                field,
                update_data[field],
            )

    fee_structure.total_fee = (
        fee_structure.admission_fee
        + fee_structure.tuition_fee
        + fee_structure.transport_fee
        + fee_structure.examination_fee
        + fee_structure.activity_fee
        + fee_structure.other_fee
    )

    db.commit()
    db.refresh(fee_structure)

    return fee_structure