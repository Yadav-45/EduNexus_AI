from datetime import date, datetime, timedelta
from math import ceil
from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
)
from fastapi.responses import FileResponse
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from models.document import Document
from models.document_category import DocumentCategory

from document_schemas import (
    ALLOWED_FILE_EXTENSIONS,
    DOCUMENT_APPLIES_TO,
    DOCUMENT_CATEGORY_STATUSES,
    DOCUMENT_ENTITY_TYPES,
    DOCUMENT_VERIFICATION_STATUSES,
    MAX_FILE_SIZE,
    DocumentArchiveResponse,
    DocumentCategoryArchiveResponse,
    DocumentCategoryCreate,
    DocumentCategoryListResponse,
    DocumentCategoryResponse,
    DocumentCategoryUpdate,
    DocumentCreate,
    DocumentDashboardResponse,
    DocumentExpiryListResponse,
    DocumentExpiryResponse,
    DocumentFileResponse,
    DocumentListResponse,
    DocumentResponse,
    DocumentUpdate,
    DocumentVerificationUpdate,
)

router = APIRouter(
    prefix="/documents",
    tags=["Document Management"],
)


# ============================================================
# STORAGE
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DOCUMENT_STORAGE_DIR = (
    BASE_DIR
    / "uploads"
    / "documents"
)

DOCUMENT_STORAGE_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# ROLE DEFINITIONS
# ============================================================

MANAGEMENT_ROLES = (
    "OWNER",
    "ADMIN",
)

DOCUMENT_READ_ROLES = (
    "OWNER",
    "ADMIN",
    "ACCOUNTANT",
    "TEACHER",
    "PARENT",
    "STUDENT",
)


# ============================================================
# HELPERS
# ============================================================

def get_total_pages(
    total: int,
    page_size: int,
) -> int:

    if total == 0:
        return 0

    return ceil(total / page_size)


def generate_category_code(
    db: Session,
) -> str:

    year = date.today().year

    last_category = (
        db.query(DocumentCategory)
        .filter(
            DocumentCategory.category_code.like(
                f"DOC-CAT-{year}-%"
            )
        )
        .order_by(
            DocumentCategory.id.desc()
        )
        .first()
    )

    if last_category:

        try:
            last_number = int(
                last_category.category_code
                .split("-")[-1]
            )
        except (
            ValueError,
            IndexError,
        ):
            last_number = 0

    else:
        last_number = 0

    return (
        f"DOC-CAT-{year}-"
        f"{last_number + 1:06d}"
    )


def generate_document_number(
    db: Session,
) -> str:

    year = date.today().year

    last_document = (
        db.query(Document)
        .filter(
            Document.document_number.like(
                f"DOC-{year}-%"
            )
        )
        .order_by(
            Document.id.desc()
        )
        .first()
    )

    if last_document:

        try:
            last_number = int(
                last_document.document_number
                .split("-")[-1]
            )
        except (
            ValueError,
            IndexError,
        ):
            last_number = 0

    else:
        last_number = 0

    return (
        f"DOC-{year}-"
        f"{last_number + 1:06d}"
    )


def validate_category_status(
    status: str,
):

    status = status.upper()

    if status not in DOCUMENT_CATEGORY_STATUSES:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid category status. "
                "Allowed values: "
                + ", ".join(
                    sorted(
                        DOCUMENT_CATEGORY_STATUSES
                    )
                )
            ),
        )

    return status


def validate_applies_to(
    applies_to: str,
):

    applies_to = applies_to.upper()

    if applies_to not in DOCUMENT_APPLIES_TO:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid applies_to value. "
                "Allowed values: "
                + ", ".join(
                    sorted(
                        DOCUMENT_APPLIES_TO
                    )
                )
            ),
        )

    return applies_to


def validate_entity_type(
    entity_type: str,
):

    entity_type = entity_type.upper()

    if entity_type not in DOCUMENT_ENTITY_TYPES:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid entity_type. "
                "Allowed values: "
                + ", ".join(
                    sorted(
                        DOCUMENT_ENTITY_TYPES
                    )
                )
            ),
        )

    return entity_type


def validate_verification_status(
    status: str,
):

    status = status.upper()

    if (
        status
        not in DOCUMENT_VERIFICATION_STATUSES
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid verification status. "
                "Allowed values: "
                + ", ".join(
                    sorted(
                        DOCUMENT_VERIFICATION_STATUSES
                    )
                )
            ),
        )

    return status


def validate_file_extension(
    filename: str,
):

    extension = (
        Path(filename)
        .suffix
        .lower()
    )

    if extension not in ALLOWED_FILE_EXTENSIONS:

        raise HTTPException(
            status_code=400,
            detail=(
                f"File type '{extension}' "
                "is not allowed."
            ),
        )

    return extension


async def save_uploaded_file(
    upload_file: UploadFile,
):

    if not upload_file.filename:

        raise HTTPException(
            status_code=400,
            detail="File name is required.",
        )

    extension = validate_file_extension(
        upload_file.filename
    )

    file_content = await upload_file.read()

    file_size = len(file_content)

    if file_size == 0:

        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    if file_size > MAX_FILE_SIZE:

        raise HTTPException(
            status_code=400,
            detail=(
                "File size cannot exceed "
                "10 MB."
            ),
        )

    unique_name = (
        f"{uuid4().hex}"
        f"{extension}"
    )

    destination = (
        DOCUMENT_STORAGE_DIR
        / unique_name
    )

    destination.write_bytes(
        file_content
    )

    return (
        unique_name,
        destination,
        file_size,
        extension,
    )


def safe_delete_file(
    file_path: str,
):

    try:

        path = Path(file_path)

        if path.exists():
            path.unlink()

    except Exception:
        pass


# ============================================================
# DASHBOARD
# ============================================================

@router.get(
    "/dashboard",
    response_model=DocumentDashboardResponse,
)
def get_document_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            *DOCUMENT_READ_ROLES
        )
    ),
):

    total_documents = (
        db.query(
            func.count(Document.id)
        )
        .scalar()
        or 0
    )

    active_documents = (
        db.query(
            func.count(Document.id)
        )
        .filter(
            Document.is_active.is_(True)
        )
        .scalar()
        or 0
    )

    archived_documents = (
        db.query(
            func.count(Document.id)
        )
        .filter(
            Document.is_active.is_(False)
        )
        .scalar()
        or 0
    )

    pending_verification = (
        db.query(
            func.count(Document.id)
        )
        .filter(
            Document.verification_status
            == "PENDING",
            Document.is_active.is_(True),
        )
        .scalar()
        or 0
    )

    verified_documents = (
        db.query(
            func.count(Document.id)
        )
        .filter(
            Document.verification_status
            == "VERIFIED",
            Document.is_active.is_(True),
        )
        .scalar()
        or 0
    )

    rejected_documents = (
        db.query(
            func.count(Document.id)
        )
        .filter(
            Document.verification_status
            == "REJECTED",
            Document.is_active.is_(True),
        )
        .scalar()
        or 0
    )

    today = date.today()

    expiry_limit = (
        today + timedelta(days=30)
    )

    expiring_documents = (
        db.query(
            func.count(Document.id)
        )
        .filter(
            Document.is_active.is_(True),
            Document.expiry_date.is_not(None),
            Document.expiry_date >= today,
            Document.expiry_date <= expiry_limit,
        )
        .scalar()
        or 0
    )

    expired_documents = (
        db.query(
            func.count(Document.id)
        )
        .filter(
            Document.is_active.is_(True),
            Document.expiry_date.is_not(None),
            Document.expiry_date < today,
        )
        .scalar()
        or 0
    )

    confidential_documents = (
        db.query(
            func.count(Document.id)
        )
        .filter(
            Document.is_active.is_(True),
            Document.is_confidential.is_(True),
        )
        .scalar()
        or 0
    )

    total_categories = (
        db.query(
            func.count(DocumentCategory.id)
        )
        .filter(
            DocumentCategory.is_active.is_(True)
        )
        .scalar()
        or 0
    )

    return DocumentDashboardResponse(
        total_documents=total_documents,
        active_documents=active_documents,
        archived_documents=archived_documents,
        pending_verification=pending_verification,
        verified_documents=verified_documents,
        rejected_documents=rejected_documents,
        expiring_documents=expiring_documents,
        expired_documents=expired_documents,
        confidential_documents=confidential_documents,
        total_categories=total_categories,
    )


# ============================================================
# DOCUMENT CATEGORIES
# ============================================================

@router.post(
    "/categories",
    response_model=DocumentCategoryResponse,
)
def create_document_category(
    data: DocumentCategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            *MANAGEMENT_ROLES
        )
    ),
):

    category_name = (
        data.category_name.strip()
    )

    if not category_name:

        raise HTTPException(
            status_code=400,
            detail=(
                "Category name cannot be empty."
            ),
        )

    existing = (
        db.query(DocumentCategory)
        .filter(
            func.lower(
                DocumentCategory.category_name
            )
            == category_name.lower()
        )
        .first()
    )

    if existing:

        raise HTTPException(
            status_code=400,
            detail=(
                "A document category with "
                "this name already exists."
            ),
        )

    applies_to = validate_applies_to(
        data.applies_to
    )

    status = validate_category_status(
        data.status
    )

    category = DocumentCategory(
        category_code=generate_category_code(
            db
        ),
        category_name=category_name,
        description=data.description,
        applies_to=applies_to,
        status=status,
        is_active=(
            status == "ACTIVE"
        ),
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


@router.get(
    "/categories",
    response_model=DocumentCategoryListResponse,
)
def list_document_categories(
    page: int = Query(
        1,
        ge=1,
    ),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
    search: str | None = None,
    status: str | None = None,
    include_archived: bool = False,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            *DOCUMENT_READ_ROLES
        )
    ),
):

    query = db.query(
        DocumentCategory
    )

    if not include_archived:

        query = query.filter(
            DocumentCategory.is_active.is_(True)
        )

    if search:

        search_value = (
            f"%{search.strip()}%"
        )

        query = query.filter(
            or_(
                DocumentCategory.category_code.ilike(
                    search_value
                ),
                DocumentCategory.category_name.ilike(
                    search_value
                ),
                DocumentCategory.description.ilike(
                    search_value
                ),
            )
        )

    if status:

        status = validate_category_status(
            status
        )

        query = query.filter(
            DocumentCategory.status
            == status
        )

    total = query.count()

    offset = (
        page - 1
    ) * page_size

    items = (
        query
        .order_by(
            DocumentCategory.id.desc()
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return DocumentCategoryListResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=get_total_pages(
            total,
            page_size,
        ),
    )


@router.get(
    "/categories/{category_id}",
    response_model=DocumentCategoryResponse,
)
def get_document_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            *DOCUMENT_READ_ROLES
        )
    ),
):

    category = (
        db.query(DocumentCategory)
        .filter(
            DocumentCategory.id
            == category_id
        )
        .first()
    )

    if not category:

        raise HTTPException(
            status_code=404,
            detail=(
                "Document category not found."
            ),
        )

    return category


@router.put(
    "/categories/{category_id}",
    response_model=DocumentCategoryResponse,
)
def update_document_category(
    category_id: int,
    data: DocumentCategoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            *MANAGEMENT_ROLES
        )
    ),
):

    category = (
        db.query(DocumentCategory)
        .filter(
            DocumentCategory.id
            == category_id
        )
        .first()
    )

    if not category:

        raise HTTPException(
            status_code=404,
            detail=(
                "Document category not found."
            ),
        )

    if data.category_name is not None:

        category_name = (
            data.category_name.strip()
        )

        if not category_name:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Category name cannot be empty."
                ),
            )

        duplicate = (
            db.query(DocumentCategory)
            .filter(
                func.lower(
                    DocumentCategory.category_name
                )
                == category_name.lower(),
                DocumentCategory.id
                != category_id,
            )
            .first()
        )

        if duplicate:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Another category with "
                    "this name already exists."
                ),
            )

        category.category_name = (
            category_name
        )

    if data.description is not None:
        category.description = (
            data.description
        )

    if data.applies_to is not None:
        category.applies_to = (
            validate_applies_to(
                data.applies_to
            )
        )

    if data.status is not None:

        category.status = (
            validate_category_status(
                data.status
            )
        )

        category.is_active = (
            category.status
            == "ACTIVE"
        )

    db.commit()
    db.refresh(category)

    return category


@router.delete(
    "/categories/{category_id}",
    response_model=DocumentCategoryArchiveResponse,
)
def archive_document_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            *MANAGEMENT_ROLES
        )
    ),
):

    category = (
        db.query(DocumentCategory)
        .filter(
            DocumentCategory.id
            == category_id
        )
        .first()
    )

    if not category:

        raise HTTPException(
            status_code=404,
            detail=(
                "Document category not found."
            ),
        )

    category.is_active = False
    category.status = "INACTIVE"

    db.commit()
    db.refresh(category)

    return DocumentCategoryArchiveResponse(
        id=category.id,
        category_code=category.category_code,
        is_active=category.is_active,
        message=(
            "Document category archived successfully."
        ),
    )


@router.patch(
    "/categories/{category_id}/restore",
    response_model=DocumentCategoryArchiveResponse,
)
def restore_document_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            *MANAGEMENT_ROLES
        )
    ),
):

    category = (
        db.query(DocumentCategory)
        .filter(
            DocumentCategory.id
            == category_id
        )
        .first()
    )

    if not category:

        raise HTTPException(
            status_code=404,
            detail=(
                "Document category not found."
            ),
        )

    category.is_active = True
    category.status = "ACTIVE"

    db.commit()
    db.refresh(category)

    return DocumentCategoryArchiveResponse(
        id=category.id,
        category_code=category.category_code,
        is_active=category.is_active,
        message=(
            "Document category restored successfully."
        ),
    )


# ============================================================
# DOCUMENT CREATE / UPLOAD
# ============================================================

@router.post(
    "",
    response_model=DocumentResponse,
)
async def create_document(
    file: UploadFile = File(...),

    category_id: int | None = Form(
        default=None
    ),

    title: str = Form(...),

    description: str | None = Form(
        default=None
    ),

    entity_type: str = Form(...),

    entity_id: int | None = Form(
        default=None
    ),

    document_date: date | None = Form(
        default=None
    ),

    expiry_date: date | None = Form(
        default=None
    ),

    verification_status: str = Form(
        default="PENDING"
    ),

    is_confidential: bool = Form(
        default=False
    ),

    notes: str | None = Form(
        default=None
    ),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            *MANAGEMENT_ROLES
        )
    ),
):

    title = title.strip()

    if not title:

        raise HTTPException(
            status_code=400,
            detail="Document title is required.",
        )

    entity_type = validate_entity_type(
        entity_type
    )

    verification_status = (
        validate_verification_status(
            verification_status
        )
    )

    if (
        document_date
        and expiry_date
        and expiry_date < document_date
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Expiry date cannot be "
                "before document date."
            ),
        )

    if category_id is not None:

        category = (
            db.query(DocumentCategory)
            .filter(
                DocumentCategory.id
                == category_id,
                DocumentCategory.is_active.is_(True),
            )
            .first()
        )

        if not category:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Document category not found."
                ),
            )

    (
        unique_file_name,
        destination,
        file_size,
        extension,
    ) = await save_uploaded_file(
        file
    )

    try:

        document_number = (
            generate_document_number(
                db
            )
        )

        document = Document(
            document_number=document_number,
            category_id=category_id,
            title=title,
            description=description,
            entity_type=entity_type,
            entity_id=entity_id,
            file_name=unique_file_name,
            original_file_name=(
                file.filename
            ),
            file_path=str(
                destination
            ),
            file_extension=extension,
            mime_type=(
                file.content_type
                or "application/octet-stream"
            ),
            file_size=file_size,
            document_date=document_date,
            expiry_date=expiry_date,
            verification_status=(
                verification_status
            ),
            is_confidential=is_confidential,
            is_active=True,
            uploaded_by=current_user.id,
            notes=notes,
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return document

    except Exception:

        db.rollback()

        safe_delete_file(
            str(destination)
        )

        raise


# ============================================================
# DOCUMENT LIST
# ============================================================

@router.get(
    "",
    response_model=DocumentListResponse,
)
def list_documents(
    page: int = Query(
        1,
        ge=1,
    ),

    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),

    search: str | None = None,

    entity_type: str | None = None,

    entity_id: int | None = None,

    category_id: int | None = None,

    verification_status: str | None = None,

    include_archived: bool = False,

    confidential_only: bool = False,

    expiring_only: bool = False,

    expired_only: bool = False,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            *DOCUMENT_READ_ROLES
        )
    ),
):

    query = db.query(
        Document
    )

    if not include_archived:

        query = query.filter(
            Document.is_active.is_(True)
        )

    if search:

        search_value = (
            f"%{search.strip()}%"
        )

        query = query.filter(
            or_(
                Document.document_number.ilike(
                    search_value
                ),
                Document.title.ilike(
                    search_value
                ),
                Document.description.ilike(
                    search_value
                ),
                Document.original_file_name.ilike(
                    search_value
                ),
            )
        )

    if entity_type:

        entity_type = validate_entity_type(
            entity_type
        )

        query = query.filter(
            Document.entity_type
            == entity_type
        )

    if entity_id is not None:

        query = query.filter(
            Document.entity_id
            == entity_id
        )

    if category_id is not None:

        query = query.filter(
            Document.category_id
            == category_id
        )

    if verification_status:

        verification_status = (
            validate_verification_status(
                verification_status
            )
        )

        query = query.filter(
            Document.verification_status
            == verification_status
        )

    if confidential_only:

        query = query.filter(
            Document.is_confidential.is_(True)
        )

    today = date.today()

    if expiring_only:

        expiry_limit = (
            today + timedelta(days=30)
        )

        query = query.filter(
            Document.expiry_date.is_not(None),
            Document.expiry_date >= today,
            Document.expiry_date <= expiry_limit,
        )

    if expired_only:

        query = query.filter(
            Document.expiry_date.is_not(None),
            Document.expiry_date < today,
        )

    total = query.count()

    offset = (
        page - 1
    ) * page_size

    items = (
        query
        .order_by(
            Document.id.desc()
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return DocumentListResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=get_total_pages(
            total,
            page_size,
        ),
    )


# ============================================================
# DOCUMENT DETAILS
# ============================================================

@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            *DOCUMENT_READ_ROLES
        )
    ),
):

    document = (
        db.query(Document)
        .filter(
            Document.id
            == document_id
        )
        .first()
    )

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    return document


# ============================================================
# DOCUMENT UPDATE
# ============================================================

@router.put(
    "/{document_id}",
    response_model=DocumentResponse,
)
def update_document(
    document_id: int,
    data: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            *MANAGEMENT_ROLES
        )
    ),
):

    document = (
        db.query(Document)
        .filter(
            Document.id
            == document_id
        )
        .first()
    )

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    if data.category_id is not None:

        category = (
            db.query(DocumentCategory)
            .filter(
                DocumentCategory.id
                == data.category_id,
                DocumentCategory.is_active.is_(True),
            )
            .first()
        )

        if not category:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Document category not found."
                ),
            )

        document.category_id = (
            data.category_id
        )

    if data.title is not None:

        title = data.title.strip()

        if not title:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Document title cannot be empty."
                ),
            )

        document.title = title

    if data.description is not None:
        document.description = (
            data.description
        )

    if data.document_date is not None:
        document.document_date = (
            data.document_date
        )

    if data.expiry_date is not None:
        document.expiry_date = (
            data.expiry_date
        )

    if (
        document.document_date
        and document.expiry_date
        and document.expiry_date
        < document.document_date
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Expiry date cannot be "
                "before document date."
            ),
        )

    if data.verification_status is not None:

        document.verification_status = (
            validate_verification_status(
                data.verification_status
            )
        )

    if data.is_confidential is not None:

        document.is_confidential = (
            data.is_confidential
        )

    if data.notes is not None:
        document.notes = data.notes

    db.commit()
    db.refresh(document)

    return document


# ============================================================
# DOCUMENT VERIFICATION
# ============================================================

@router.patch(
    "/{document_id}/verification",
    response_model=DocumentResponse,
)
def update_document_verification(
    document_id: int,
    data: DocumentVerificationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            *MANAGEMENT_ROLES
        )
    ),
):

    document = (
        db.query(Document)
        .filter(
            Document.id
            == document_id
        )
        .first()
    )

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    verification_status = (
        validate_verification_status(
            data.verification_status
        )
    )

    document.verification_status = (
        verification_status
    )

    if data.notes is not None:
        document.notes = data.notes

    if verification_status == "VERIFIED":

        document.verified_by = (
            current_user.id
        )

        document.verified_at = (
            datetime.utcnow()
        )

    else:

        document.verified_by = None
        document.verified_at = None

    db.commit()
    db.refresh(document)

    return document


# ============================================================
# DOCUMENT ARCHIVE
# ============================================================

@router.delete(
    "/{document_id}",
    response_model=DocumentArchiveResponse,
)
def archive_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            *MANAGEMENT_ROLES
        )
    ),
):

    document = (
        db.query(Document)
        .filter(
            Document.id
            == document_id
        )
        .first()
    )

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    document.is_active = False

    db.commit()
    db.refresh(document)

    return DocumentArchiveResponse(
        id=document.id,
        document_number=(
            document.document_number
        ),
        is_active=document.is_active,
        message=(
            "Document archived successfully."
        ),
    )


# ============================================================
# DOCUMENT RESTORE
# ============================================================

@router.patch(
    "/{document_id}/restore",
    response_model=DocumentArchiveResponse,
)
def restore_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            *MANAGEMENT_ROLES
        )
    ),
):

    document = (
        db.query(Document)
        .filter(
            Document.id
            == document_id
        )
        .first()
    )

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    document.is_active = True

    db.commit()
    db.refresh(document)

    return DocumentArchiveResponse(
        id=document.id,
        document_number=(
            document.document_number
        ),
        is_active=document.is_active,
        message=(
            "Document restored successfully."
        ),
    )


# ============================================================
# DOCUMENT FILE INFORMATION
# ============================================================

@router.get(
    "/{document_id}/file",
    response_model=DocumentFileResponse,
)
def get_document_file_information(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            *DOCUMENT_READ_ROLES
        )
    ),
):

    document = (
        db.query(Document)
        .filter(
            Document.id
            == document_id
        )
        .first()
    )

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    file_path = Path(
        document.file_path
    )

    return DocumentFileResponse(
        id=document.id,
        document_number=(
            document.document_number
        ),
        original_file_name=(
            document.original_file_name
        ),
        file_name=document.file_name,
        file_extension=(
            document.file_extension
        ),
        mime_type=document.mime_type,
        file_size=document.file_size,
        download_available=(
            file_path.exists()
        ),
    )


# ============================================================
# DOCUMENT DOWNLOAD
# ============================================================

@router.get(
    "/{document_id}/download"
)
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            *DOCUMENT_READ_ROLES
        )
    ),
):

    document = (
        db.query(Document)
        .filter(
            Document.id
            == document_id
        )
        .first()
    )

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    if not document.is_active:

        raise HTTPException(
            status_code=400,
            detail=(
                "This document has been archived."
            ),
        )

    file_path = Path(
        document.file_path
    )

    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail=(
                "Document file could not be found."
            ),
        )

    return FileResponse(
        path=str(file_path),
        media_type=document.mime_type,
        filename=document.original_file_name,
    )


# ============================================================
# EXPIRING DOCUMENTS
# ============================================================

@router.get(
    "/expiry/list",
    response_model=DocumentExpiryListResponse,
)
def list_expiring_documents(
    page: int = Query(
        1,
        ge=1,
    ),

    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),

    days: int = Query(
        30,
        ge=1,
        le=3650,
    ),

    include_expired: bool = False,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            *DOCUMENT_READ_ROLES
        )
    ),
):

    today = date.today()

    expiry_limit = (
        today
        + timedelta(days=days)
    )

    query = (
        db.query(Document)
        .filter(
            Document.is_active.is_(True),
            Document.expiry_date.is_not(None),
        )
    )

    if include_expired:

        query = query.filter(
            Document.expiry_date
            <= expiry_limit
        )

    else:

        query = query.filter(
            Document.expiry_date >= today,
            Document.expiry_date
            <= expiry_limit,
        )

    total = query.count()

    offset = (
        page - 1
    ) * page_size

    documents = (
        query
        .order_by(
            Document.expiry_date.asc()
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    items = []

    for document in documents:

        days_remaining = (
            document.expiry_date
            - today
        ).days

        items.append(
            DocumentExpiryResponse(
                id=document.id,
                document_number=(
                    document.document_number
                ),
                title=document.title,
                entity_type=(
                    document.entity_type
                ),
                entity_id=document.entity_id,
                expiry_date=(
                    document.expiry_date
                ),
                days_remaining=(
                    days_remaining
                ),
                verification_status=(
                    document.verification_status
                ),
                is_active=(
                    document.is_active
                ),
            )
        )

    return DocumentExpiryListResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=get_total_pages(
            total,
            page_size,
        ),
    )