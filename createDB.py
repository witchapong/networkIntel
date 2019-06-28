import sqlite3
import pandas as pd

conn = sqlite3.connect('latent_traffic.db')
c = conn.cursor()

#MATURED TRAFFIC
#################################################################################
# Create table
c.execute('''CREATE TABLE if not exists sector_traffic_matured
             (SECTOR text, LATENT_TRAFFIC real, month_year text)''')

# read the file and create a list of tuple
df = pd.read_csv('src/latent_traffic_sector.csv')
data = [(row['sector'], row['latent_traffic'], row['month_year']) for _, row in df.iterrows()]

print('data:\n', data[:5])

# write to database
c.executemany('INSERT INTO sector_traffic_matured VALUES (?,?,?)', data)

conn.commit()

# read
i = 0
for row in c.execute('SELECT * FROM sector_traffic_matured'):
    print('row', row)
    if i == 5: break
    i += 1

print('count all:\n', c.execute('SELECT COUNT(*) FROM sector_traffic_matured').fetchone())

#PREMATURED TRAFFIC
#################################################################################
# Create table
c.execute('''CREATE TABLE if not exists sector_traffic_prematured
             (SECTOR text, LATENT_TRAFFIC real, month_year text)''')

# read the file and create a list of tuple
df = pd.read_csv('src/latent_traffic_sector2.csv')
data = [(row['sector'], row['latent_traffic'], row['month_year']) for _, row in df.iterrows()]

print('data:\n', data[:5])

# write to database
c.executemany('INSERT INTO sector_traffic_prematured VALUES (?,?,?)', data)

conn.commit()

# read
i = 0
for row in c.execute('SELECT * FROM sector_traffic_prematured'):
    print('row', row)
    if i == 5: break
    i += 1

print('count all:\n', c.execute('SELECT COUNT(*) FROM sector_traffic_prematured').fetchone())

conn.close()