import sqlite3
import pandas as pd

conn = sqlite3.connect('latent_traffic.db')
c = conn.cursor()

# Create table
c.execute('''CREATE TABLE if not exists site_traffic
             (SITE_CODE text, LATENT_TRAFFIC real, month_year text, LAT real, LON real)''')

# read the file and create a list of tuple
df = pd.read_csv('src/latent_traffic_site.csv')
data = [(row['site_code'], row['LATENT_TRAFFIC'], row['month_year'], row['LAT'],row['LON']) for _, row in df.iterrows()]

print('data:\n', data[:5])

# write to database
c.executemany('INSERT INTO site_traffic VALUES (?,?,?,?,?)', data)

conn.commit()

# read
i = 0
for row in c.execute('SELECT * FROM site_traffic'):
    print('row', row)
    if i == 5: break
    i += 1

print('count all:\n', c.execute('SELECT COUNT(*) FROM site_traffic').fetchone())

conn.close()