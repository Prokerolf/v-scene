import json
from fpdf import FPDF

def create_pdf(json_file, output_pdf):
    with open(json_file, 'r', encoding='utf-8') as f:
        accounts = json.load(f)

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    
    # Title
    pdf.cell(200, 10, txt="V-SCENE User Accounts", ln=1, align='L')
    pdf.ln(5)
    
    # Admin Account
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(200, 10, txt="Admin Account", ln=1)
    pdf.set_font("Arial", '', 11)
    pdf.cell(200, 8, txt="Username: admin", ln=1)
    pdf.cell(200, 8, txt="Password: password123", ln=1)
    pdf.ln(10)
    
    # Student Accounts
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(200, 10, txt="Student Accounts (VS001 - VS100)", ln=1)
    pdf.ln(5)
    
    # Table Header
    pdf.set_font("Arial", 'B', 11)
    pdf.cell(20, 10, "No.", 1)
    pdf.cell(60, 10, "Username", 1)
    pdf.cell(60, 10, "Password", 1)
    pdf.ln()
    
    # Table Content
    pdf.set_font("Arial", '', 11)
    students = [a for a in accounts if a.get('role') == 'student']
    for i, a in enumerate(students):
        pdf.cell(20, 8, str(i + 1), 1)
        pdf.cell(60, 8, a['username'], 1)
        pdf.cell(60, 8, a['password'], 1)
        pdf.ln()

    pdf.output(output_pdf)

if __name__ == '__main__':
    create_pdf('src/data/accounts.json', '/Users/phakansitketwiset/.gemini/antigravity/brain/04775cac-96ed-45da-a662-c7850d1a0ca8/vscene_accounts.pdf')
