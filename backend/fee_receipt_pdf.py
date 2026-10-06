from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


def generate_fee_receipt_pdf(
    receipt,
    student,
    output_path: str,
    school_name: str = "EduNexus AI",
):
    """
    Generate a professional fee receipt PDF.
    """

    output_file = Path(output_path)
    output_file.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    document = SimpleDocTemplate(
        str(output_file),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title=f"Fee Receipt - {receipt.receipt_number}",
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReceiptTitle",
        parent=styles["Title"],
        fontSize=18,
        leading=22,
        alignment=1,
        spaceAfter=6,
    )

    subtitle_style = ParagraphStyle(
        "ReceiptSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        alignment=1,
        textColor=colors.grey,
        spaceAfter=14,
    )

    section_style = ParagraphStyle(
        "Section",
        parent=styles["Heading3"],
        fontSize=11,
        leading=14,
        spaceBefore=8,
        spaceAfter=6,
    )

    normal_style = ParagraphStyle(
        "ReceiptNormal",
        parent=styles["Normal"],
        fontSize=9.5,
        leading=13,
    )

    elements = []

    # Header
    elements.append(
        Paragraph(
            school_name,
            title_style,
        )
    )

    elements.append(
        Paragraph(
            "OFFICIAL FEE PAYMENT RECEIPT",
            subtitle_style,
        )
    )

    # Receipt information
    receipt_info = [
        [
            Paragraph("<b>Receipt Number</b>", normal_style),
            Paragraph(
                str(receipt.receipt_number),
                normal_style,
            ),
            Paragraph("<b>Receipt Date</b>", normal_style),
            Paragraph(
                receipt.receipt_date.strftime(
                    "%d-%m-%Y"
                ),
                normal_style,
            ),
        ],
        [
            Paragraph("<b>Payment Method</b>", normal_style),
            Paragraph(
                str(receipt.payment_method),
                normal_style,
            ),
            Paragraph("<b>Status</b>", normal_style),
            Paragraph(
                str(receipt.status),
                normal_style,
            ),
        ],
    ]

    receipt_table = Table(
        receipt_info,
        colWidths=[
            35 * mm,
            55 * mm,
            30 * mm,
            45 * mm,
        ],
    )

    receipt_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.whitesmoke,
                ),
                (
                    "BACKGROUND",
                    (2, 0),
                    (2, -1),
                    colors.whitesmoke,
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    elements.append(receipt_table)
    elements.append(Spacer(1, 10))

    # Student information
    elements.append(
        Paragraph(
            "Student Information",
            section_style,
        )
    )

    student_name = (
        f"{student.first_name} "
        f"{student.last_name or ''}"
    ).strip()

    student_info = [
        [
            Paragraph("<b>Student Name</b>", normal_style),
            Paragraph(student_name, normal_style),
        ],
        [
            Paragraph(
                "<b>Admission Number</b>",
                normal_style,
            ),
            Paragraph(
                str(student.admission_number),
                normal_style,
            ),
        ],
        [
            Paragraph(
                "<b>Class</b>",
                normal_style,
            ),
            Paragraph(
                str(student.class_name or "-"),
                normal_style,
            ),
        ],
        [
            Paragraph(
                "<b>Academic Year</b>",
                normal_style,
            ),
            Paragraph(
                str(student.academic_year or "-"),
                normal_style,
            ),
        ],
    ]

    student_table = Table(
        student_info,
        colWidths=[
            45 * mm,
            120 * mm,
        ],
    )

    student_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.whitesmoke,
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    elements.append(student_table)
    elements.append(Spacer(1, 10))

    # Payment details
    elements.append(
        Paragraph(
            "Payment Details",
            section_style,
        )
    )

    payment_info = [
        [
            Paragraph(
                "<b>Description</b>",
                normal_style,
            ),
            Paragraph(
                "<b>Amount</b>",
                normal_style,
            ),
        ],
        [
            Paragraph(
                "Fee Payment",
                normal_style,
            ),
            Paragraph(
                f"₹ {receipt.amount:,.2f}",
                normal_style,
            ),
        ],
    ]

    payment_table = Table(
        payment_info,
        colWidths=[
            120 * mm,
            45 * mm,
        ],
    )

    payment_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.whitesmoke,
                ),
                (
                    "ALIGN",
                    (1, 0),
                    (1, -1),
                    "RIGHT",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    elements.append(payment_table)
    elements.append(Spacer(1, 10))

    # Balance information
    balance_info = [
        [
            Paragraph(
                "<b>Previous Balance</b>",
                normal_style,
            ),
            Paragraph(
                f"₹ {receipt.previous_balance:,.2f}",
                normal_style,
            ),
        ],
        [
            Paragraph(
                "<b>Amount Paid</b>",
                normal_style,
            ),
            Paragraph(
                f"₹ {receipt.amount:,.2f}",
                normal_style,
            ),
        ],
        [
            Paragraph(
                "<b>Remaining Balance</b>",
                normal_style,
            ),
            Paragraph(
                f"₹ {receipt.remaining_balance:,.2f}",
                normal_style,
            ),
        ],
    ]

    balance_table = Table(
        balance_info,
        colWidths=[
            120 * mm,
            45 * mm,
        ],
    )

    balance_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "ALIGN",
                    (1, 0),
                    (1, -1),
                    "RIGHT",
                ),
                (
                    "BACKGROUND",
                    (0, 2),
                    (-1, 2),
                    colors.whitesmoke,
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    elements.append(balance_table)
    elements.append(Spacer(1, 12))

    # Transaction reference
    if receipt.transaction_reference:
        elements.append(
            Paragraph(
                (
                    "<b>Transaction Reference:</b> "
                    f"{receipt.transaction_reference}"
                ),
                normal_style,
            )
        )
        elements.append(Spacer(1, 6))

    # Remarks
    if receipt.remarks:
        elements.append(
            Paragraph(
                f"<b>Remarks:</b> {receipt.remarks}",
                normal_style,
            )
        )

    elements.append(Spacer(1, 25))

    # Signature section
    signature_table = Table(
        [
            [
                Paragraph(
                    "Authorized Signature",
                    normal_style,
                ),
                Paragraph(
                    "Parent / Guardian Signature",
                    normal_style,
                ),
            ]
        ],
        colWidths=[
            82.5 * mm,
            82.5 * mm,
        ],
    )

    signature_table.setStyle(
        TableStyle(
            [
                (
                    "LINEABOVE",
                    (0, 0),
                    (-1, 0),
                    0.5,
                    colors.grey,
                ),
                (
                    "ALIGN",
                    (0, 0),
                    (-1, -1),
                    "CENTER",
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
            ]
        )
    )

    elements.append(signature_table)
    elements.append(Spacer(1, 15))

    elements.append(
        Paragraph(
            "This is a computer-generated fee receipt.",
            subtitle_style,
        )
    )

    document.build(elements)

    return str(output_file)