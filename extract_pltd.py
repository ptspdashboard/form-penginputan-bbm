import pandas as pd

file_path = r'C:\Users\user\OneDrive\Documents\AMELIA KASRIN\KERJA\PT SEMEN PADANG TAMBANG\LAPORAN PENGAMBILAN BBM KE PLTD (BARU) (1).xlsx'
df = pd.read_excel(file_path, sheet_name='PLTD JAN 2026', skiprows=7)
print("Columns:", df.columns.tolist())
for i, row in df.head(5).iterrows():
    print(row.to_dict())
