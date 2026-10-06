from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class TutorQuestion(BaseModel):
    question: str


@router.post("/ai-tutor")
def ask_ai_tutor(data: TutorQuestion):
    question = data.question.strip().lower()

    if not question:
        return {
            "answer": "Please enter a question."
        }

    if "python" in question and "variable" in question:
        answer = (
            "A variable in Python is a name used to store a value. "
            "For example: name = 'Aayush'. Here, name is the variable "
            "and 'Aayush' is its value."
        )

    elif "python" in question and "loop" in question:
        answer = (
            "A loop allows you to repeat code. A common example is a "
            "for loop:\n\n"
            "for i in range(5):\n"
            "    print(i)\n\n"
            "This prints the numbers 0 through 4."
        )

    elif "python" in question and "function" in question:
        answer = (
            "A function is a reusable block of code. For example:\n\n"
            "def greet(name):\n"
            "    return 'Hello ' + name\n\n"
            "You can then call it using greet('Student')."
        )

    elif "python" in question:
        answer = (
            "Python is a high-level programming language known for "
            "its simple syntax and readability. It is commonly used "
            "for web development, automation, data science, AI and "
            "many other applications."
        )

    elif "assignment" in question:
        answer = (
            "You can view your assignments from the Assignments page "
            "on your EduNexus dashboard. Complete each assignment "
            "to keep track of your progress."
        )

    else:
        answer = (
            "I'm your EduNexus AI Tutor. I can currently help you "
            "with Python, programming concepts, assignments and "
            "your course learning. Try asking me a Python question!"
        )

    return {
        "answer": answer
    }