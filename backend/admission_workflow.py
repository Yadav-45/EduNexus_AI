ALLOWED_STATUSES = {
    "APPLIED",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
    "WAITLISTED",
    "ENROLLED",
}


ALLOWED_TRANSITIONS = {
    "APPLIED": {
        "UNDER_REVIEW",
        "REJECTED",
    },
    "UNDER_REVIEW": {
        "APPROVED",
        "REJECTED",
        "WAITLISTED",
    },
    "APPROVED": {
        "ENROLLED",
    },
    "WAITLISTED": {
        "UNDER_REVIEW",
        "REJECTED",
    },
    "REJECTED": set(),
    "ENROLLED": set(),
}


def validate_status_transition(
    current_status: str,
    new_status: str,
) -> bool:
    """
    Check whether an admission status transition
    is allowed.
    """

    if new_status not in ALLOWED_STATUSES:
        return False

    allowed_next_statuses = ALLOWED_TRANSITIONS.get(
        current_status,
        set(),
    )

    return new_status in allowed_next_statuses