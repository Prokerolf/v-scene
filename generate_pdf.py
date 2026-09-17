import json
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import sys

def create_pdf(json_file, output_pdf):
    with open(json_file, 'r', encoding='utf-8') as f:
        accounts = json.load(f)

    c = canvas.Canvas(output_pdf, pagesize=A4)
    width, height = A4
    y = height - 50

    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, y, "V-SCENE User Accounts")
    y -= 40

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Admin Account")
    y -= 20
    
    c.setFont("Helvetica", 12)
    c.drawString(50, y, "Username: admin")
    y -= 15
    c.drawString(50, y, "Password: password123")
    y -= 30

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Student Accounts (VS001 - VS100)")
    y -= 20

    # Draw Table Header
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "No.")
    c.drawString(100, y, "Username")
    c.drawString(200, y, "Password")
    y -= 20

    c.setFont("Helvetica", 12)
    students = [a for a in accounts if a.get('role') == 'student']
    
    for i, a in enumerate(students):
        if y < 50:
            c.showPage()
            y = height - 50
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y, "No.")
            c.drawString(100, y, "Username")
            c.drawString(200, y, "Password")
            y -= 20
            c.setFont("Helvetica", 12)
            
        c.drawString(50, y, str(i + 1))
        c.drawString(100, y, a['username'])
        c.drawString(200, y, a['password'])
        y -= 15

    c.save()

if __name__ == '__main__':
    create_pdf('src/data/accounts.json', '/Users/phakansitketwiset/.gemini/antigravity/brain/04775cac-96ed-45da-a662-c7850d1a0ca8/vscene_accounts.pdf')
