import pandas as pd
import json

file_path = r'D:\Form Penginputan BBM\form-penginputan-bbm\public\template_pengisian.xlsx'

try:
    xl = pd.ExcelFile(file_path)
    analysis = {}
    
    important_sheets = ['CALC', 'MEI', 'Akumulasi Harian Solar', 'FUEL CONSUMPTION MEI']
    
    for sheet in important_sheets:
        if sheet in xl.sheet_names:
            # Baca 15 baris pertama untuk melihat struktur header dan datanya
            df = pd.read_excel(file_path, sheet_name=sheet, header=None, nrows=20)
            
            # Konversi NaN jadi string kosong agar rapi di JSON
            df_clean = df.fillna("").values.tolist()
            analysis[sheet] = df_clean

    with open(r'D:\Form Penginputan BBM\form-penginputan-bbm\full_analysis.json', 'w') as f:
        json.dump(analysis, f, indent=2)
        
    print("Analisis selesai. Tersimpan di full_analysis.json")
except Exception as e:
    print(f"Error: {e}")
