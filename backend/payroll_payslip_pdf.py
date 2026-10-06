from io import BytesIO
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)


# ============================================================
# HELPERS
# ============================================================

def money(value):
    try:
        return f"₹ {float(value or 0):,.2f}"
    except (TypeError, ValueError):
        return "₹ 0.00"


def safe_text(value):
    if value is None or value == "":
        return "-"
    return str(value)


def format_date(value):
    if not value:
        return "-"

    if isinstance(value, date):
        return value.strftime("%d %b %Y")

    return str(value)


def month_name(month):
    months = [
        "",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    try:
        return months[int(month)]
    except (ValueError, TypeError, IndexError):
        return "-"


# ============================================================
# PDF GENERATOR
# ============================================================

def generate_payroll_payslip_pdf(
    payslip,
    staff=None,
):
    """
    Generate a professional payroll payslip PDF.

    Parameters
    ----------
    payslip:
        PayrollPayslip SQLAlchemy object.

    staff:
        Staff SQLAlchemy object. Optional.

    Returns
    -------
    BytesIO
        Generated PDF in memory.
    """

    buffer = BytesIO()

    # ========================================================
    # DOCUMENT
    # ========================================================

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
        title=f"Payslip {safe_text(payslip.payslip_number)}",
        author="EduNexus",
    )

    # ========================================================
    # STYLES
    # ========================================================

    styles = getSampleStyleSheet()

    school_name_style = ParagraphStyle(
        "SchoolName",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        alignment=TA_CENTER,
        spaceAfter=4,
    )

    school_subtitle_style = ParagraphStyle(
        "SchoolSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.grey,
    )

    title_style = ParagraphStyle(
        "Title",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        alignment=TA_CENTER,
        spaceBefore=8,
        spaceAfter=8,
    )

    section_style = ParagraphStyle(
        "Section",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        spaceBefore=5,
        spaceAfter=5,
    )

    label_style = ParagraphStyle(
        "Label",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
    )

    value_style = ParagraphStyle(
        "Value",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        alignment=TA_LEFT,
    )

    table_value_style = ParagraphStyle(
        "TableValue",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
    )

    table_value_right_style = ParagraphStyle(
        "TableValueRight",
        parent=table_value_style,
        alignment=TA_RIGHT,
    )

    net_salary_style = ParagraphStyle(
        "NetSalary",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        alignment=TA_RIGHT,
    )

    footer_style = ParagraphStyle(
        "Footer",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=10,
        alignment=TA_CENTER,
        textColor=colors.grey,
    )

    # ========================================================
    # STORY
    # ========================================================

    story = []

    # ========================================================
    # SCHOOL HEADER
    # ========================================================

    story.append(
        Paragraph(
            "EDUNEXUS SCHOOL",
            school_name_style,
        )
    )

    story.append(
        Paragraph(
            "Intelligent School Operating System",
            school_subtitle_style,
        )
    )

    story.append(Spacer(1, 3 * mm))

    story.append(
        HRFlowable(
            width="100%",
            thickness=1,
            color=colors.black,
            spaceBefore=2,
            spaceAfter=5,
        )
    )

    story.append(
        Paragraph(
            "SALARY PAYSLIP",
            title_style,
        )
    )

    # ========================================================
    # PAYSLIP META
    # ========================================================

    meta_data = [
        [
            Paragraph("<b>Payslip Number</b>", label_style),
            Paragraph(
                safe_text(payslip.payslip_number),
                value_style,
            ),
            Paragraph("<b>Salary Period</b>", label_style),
            Paragraph(
                f"{month_name(payslip.payroll_month)} "
                f"{safe_text(payslip.payroll_year)}",
                value_style,
            ),
        ],
        [
            Paragraph("<b>Pay Date</b>", label_style),
            Paragraph(
                format_date(payslip.pay_date),
                value_style,
            ),
            Paragraph("<b>Payment Status</b>", label_style),
            Paragraph(
                safe_text(payslip.payment_status),
                value_style,
            ),
        ],
    ]

    meta_table = Table(
        meta_data,
        colWidths=[
            35 * mm,
            50 * mm,
            35 * mm,
            50 * mm,
        ],
    )

    meta_table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BACKGROUND", (0, 0), (0, -1), colors.whitesmoke),
                ("BACKGROUND", (2, 0), (2, -1), colors.whitesmoke),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )

    story.append(meta_table)

    # ========================================================
    # EMPLOYEE INFORMATION
    # ========================================================

    story.append(
        Paragraph(
            "Employee Information",
            section_style,
        )
    )

    staff_name = "-"

    if staff:
        first_name = safe_text(
            getattr(staff, "first_name", "")
        )

        last_name = safe_text(
            getattr(staff, "last_name", "")
        )

        staff_name = (
            f"{first_name} {last_name}"
        ).strip()

    employee_data = [
        [
            Paragraph("<b>Employee Name</b>", label_style),
            Paragraph(staff_name, value_style),
            Paragraph("<b>Staff ID</b>", label_style),
            Paragraph(
                safe_text(
                    getattr(staff, "staff_id", "-")
                    if staff
                    else "-"
                ),
                value_style,
            ),
        ],
        [
            Paragraph("<b>Department</b>", label_style),
            Paragraph(
                safe_text(
                    getattr(staff, "department", "-")
                    if staff
                    else "-"
                ),
                value_style,
            ),
            Paragraph("<b>Designation</b>", label_style),
            Paragraph(
                safe_text(
                    getattr(staff, "designation", "-")
                    if staff
                    else "-"
                ),
                value_style,
            ),
        ],
        [
            Paragraph("<b>Employment Type</b>", label_style),
            Paragraph(
                safe_text(
                    getattr(staff, "employment_type", "-")
                    if staff
                    else "-"
                ),
                value_style,
            ),
            Paragraph("<b>Joining Date</b>", label_style),
            Paragraph(
                format_date(
                    getattr(staff, "joining_date", None)
                    if staff
                    else None
                ),
                value_style,
            ),
        ],
    ]

    employee_table = Table(
        employee_data,
        colWidths=[
            35 * mm,
            50 * mm,
            35 * mm,
            50 * mm,
        ],
    )

    employee_table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BACKGROUND", (0, 0), (0, -1), colors.whitesmoke),
                ("BACKGROUND", (2, 0), (2, -1), colors.whitesmoke),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )

    story.append(employee_table)

    # ========================================================
    # ATTENDANCE SUMMARY
    # ========================================================

    story.append(
        Paragraph(
            "Attendance Summary",
            section_style,
        )
    )

    attendance_data = [
        [
            Paragraph("Working Days", table_header_style),
            Paragraph("Present", table_header_style),
            Paragraph("Absent", table_header_style),
            Paragraph("Leave", table_header_style),
            Paragraph("Half Days", table_header_style),
            Paragraph("LOP Days", table_header_style),
        ],
        [
            Paragraph(
                safe_text(payslip.total_working_days),
                table_value_style,
            ),
            Paragraph(
                safe_text(payslip.days_present),
                table_value_style,
            ),
            Paragraph(
                safe_text(payslip.days_absent),
                table_value_style,
            ),
            Paragraph(
                safe_text(payslip.days_on_leave),
                table_value_style,
            ),
            Paragraph(
                safe_text(payslip.half_days),
                table_value_style,
            ),
            Paragraph(
                safe_text(payslip.loss_of_pay_days),
                table_value_style,
            ),
        ],
    ]

    attendance_table = Table(
        attendance_data,
        colWidths=[
            28 * mm,
            28 * mm,
            28 * mm,
            28 * mm,
            28 * mm,
            28 * mm,
        ],
    )

    attendance_table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )

    story.append(attendance_table)

    # ========================================================
    # EARNINGS & DEDUCTIONS
    # ========================================================

    story.append(
        Paragraph(
            "Salary Details",
            section_style,
        )
    )

    earnings_data = [
        [
            Paragraph("Earnings", table_header_style),
            Paragraph("Amount", table_header_style),
            Paragraph("Deductions", table_header_style),
            Paragraph("Amount", table_header_style),
        ],
        [
            Paragraph("Basic Salary", table_value_style),
            Paragraph(
                money(payslip.basic_salary),
                table_value_right_style,
            ),
            Paragraph("Loss of Pay", table_value_style),
            Paragraph(
                money(payslip.loss_of_pay_amount),
                table_value_right_style,
            ),
        ],
        [
            Paragraph("Allowances", table_value_style),
            Paragraph(
                money(payslip.allowances),
                table_value_right_style,
            ),
            Paragraph("Other Deductions", table_value_style),
            Paragraph(
                money(payslip.other_deductions),
                table_value_right_style,
            ),
        ],
        [
            Paragraph("Overtime", table_value_style),
            Paragraph(
                money(payslip.overtime_amount),
                table_value_right_style,
            ),
            Paragraph("Total Deductions", table_value_style),
            Paragraph(
                money(payslip.total_deductions),
                table_value_right_style,
            ),
        ],
        [
            Paragraph("Bonus", table_value_style),
            Paragraph(
                money(payslip.bonus_amount),
                table_value_right_style,
            ),
            Paragraph("", table_value_style),
            Paragraph("", table_value_style),
        ],
        [
            Paragraph("<b>Gross Salary</b>", table_value_style),
            Paragraph(
                f"<b>{money(payslip.gross_salary)}</b>",
                table_value_right_style,
            ),
            Paragraph("", table_value_style),
            Paragraph("", table_value_style),
        ],
    ]

    salary_table = Table(
        earnings_data,
        colWidths=[
            43 * mm,
            42 * mm,
            43 * mm,
            42 * mm,
        ],
    )

    salary_table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (1, 1), (1, -1), "RIGHT"),
                ("ALIGN", (3, 1), (3, -1), "RIGHT"),
                ("SPAN", (2, 4), (3, 4)),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )

    story.append(salary_table)

    # ========================================================
    # NET SALARY
    # ========================================================

    story.append(Spacer(1, 5 * mm))

    net_data = [
        [
            Paragraph(
                "<b>NET SALARY</b>",
                label_style,
            ),
            Paragraph(
                money(payslip.net_salary),
                net_salary_style,
            ),
        ]
    ]

    net_table = Table(
        net_data,
        colWidths=[
            100 * mm,
            70 * mm,
        ],
    )

    net_table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 1, colors.black),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ]
        )
    )

    story.append(net_table)

    # ========================================================
    # PAYMENT INFORMATION
    # ========================================================

    story.append(
        Paragraph(
            "Payment Information",
            section_style,
        )
    )

    payment_data = [
        [
            Paragraph("<b>Payment Method</b>", label_style),
            Paragraph(
                safe_text(payslip.payment_method),
                value_style,
            ),
            Paragraph("<b>Payment Date</b>", label_style),
            Paragraph(
                format_date(payslip.payment_date),
                value_style,
            ),
        ],
        [
            Paragraph("<b>Payment Reference</b>", label_style),
            Paragraph(
                safe_text(payslip.payment_reference),
                value_style,
            ),
            Paragraph("<b>Status</b>", label_style),
            Paragraph(
                safe_text(payslip.payment_status),
                value_style,
            ),
        ],
    ]

    payment_table = Table(
        payment_data,
        colWidths=[
            35 * mm,
            50 * mm,
            35 * mm,
            50 * mm,
        ],
    )

    payment_table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (0, -1), colors.whitesmoke),
                ("BACKGROUND", (2, 0), (2, -1), colors.whitesmoke),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )

    story.append(payment_table)

    # ========================================================
    # REMARKS
    # ========================================================

    if payslip.remarks:
        story.append(
            Paragraph(
                "Remarks",
                section_style,
            )
        )

        remarks_table = Table(
            [
                [
                    Paragraph(
                        safe_text(payslip.remarks),
                        value_style,
                    )
                ]
            ],
            colWidths=[170 * mm],
        )

        remarks_table.setStyle(
            TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )

        story.append(remarks_table)

    # ========================================================
    # FOOTER
    # ========================================================

    story.append(Spacer(1, 10 * mm))

    story.append(
        HRFlowable(
            width="100%",
            thickness=0.5,
            color=colors.grey,
            spaceBefore=2,
            spaceAfter=5,
        )
    )

    story.append(
        Paragraph(
            "This is a system-generated payslip from EduNexus.",
            footer_style,
        )
    )

    story.append(
        Paragraph(
            "Please retain this document for your records.",
            footer_style,
        )
    )

    # ========================================================
    # BUILD PDF
    # ========================================================

    document.build(story)

    buffer.seek(0)

    return buffer