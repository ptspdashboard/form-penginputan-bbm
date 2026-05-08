import pandas as pd
import json

file_path = r'D:\Form Penginputan BBM\form-penginputan-bbm\public\template_pengisian.xlsx'

df = pd.read_excel(file_path, sheet_name='PENGISIAN', header=None)

# We know data starts at row index 6 (Row 7).
# Column 1 = Perusahaan, Column 2 = Jenis Alat, Column 3 = Tipe Unit
df = df.iloc[6:, 1:4]
df.columns = ['Perusahaan', 'Jenis_Alat', 'Tipe_Unit']

# Ffill Perusahaan and Jenis Alat
df['Perusahaan'] = df['Perusahaan'].ffill()
df['Jenis_Alat'] = df['Jenis_Alat'].ffill()

# Drop NA rows for Tipe Unit
df = df.dropna(subset=['Tipe_Unit'])
df = df[df['Tipe_Unit'].astype(str).str.strip() != ""]
df = df[~df['Tipe_Unit'].astype(str).str.contains('Total', case=False, na=False)]

master_data = []
for idx, row in df.iterrows():
    p = str(row['Perusahaan']).strip()
    j = str(row['Jenis_Alat']).strip()
    u = str(row['Tipe_Unit']).strip()
    master_data.append({"p": p, "j": j, "u": u})

with open(r'D:\Form Penginputan BBM\form-penginputan-bbm\seed_data.json', 'w') as f:
    json.dump(master_data, f, indent=2)

print("Seed data saved to seed_data.json")
