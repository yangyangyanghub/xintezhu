import pdfplumber

with pdfplumber.open(r"D:\Desktop\关于外业就餐、加班及夜班值守餐补标准的暂行办法.pdf") as pdf:
    text = ""
    for page in pdf.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n\n"

print(text.encode('utf-8').decode('utf-8'))