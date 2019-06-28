from flask import Flask, render_template, jsonify
import json
import sqlite3

app = Flask(__name__)

# ====================Helper function====================
# query data from data base
def query(table):
    conn = sqlite3.connect('latent_traffic.db')

    c = conn.cursor()

    return c.execute(f'SELECT * FROM {table}').fetchall()


def qr2json_sector(result):
    my_json = []
    for item in result:
        my_json.append({"sector": item[0], "latent_traffic": item[1], "date_time": item[2]})

    return json.dumps(my_json)

# ====================Flask decorator====================

@app.route('/')
def main():

    return render_template('index_v2.html')

@app.route('/getMap')
def get_map():
    with open('src/thailand.json') as json_file:
        thailand_json = json.load(json_file)
    return json.dumps(thailand_json)

@app.route('/getSectorTraffic')
def get_sector_traffic():

    # query result from data base
    qr = query('sector_traffic_matured')
    json_sector = qr2json_sector(qr)

    return json_sector

@app.route('/getSectorRaw')
def get_sector_raw():
    with open('src/sector_raw.json') as json_file:
        sector_raw_json = json.load(json_file)
    return json.dumps(sector_raw_json)

@app.route('/getSectorTraffic2')
def get_sector_traffic2():

    # query result from data base
    qr = query('sector_traffic_prematured')
    json_sector = qr2json_sector(qr)

    return json_sector

@app.route('/getSectorRaw2')
def get_sector_raw2():
    with open('src/sector_raw2.json') as json_file:
        sector_raw_json = json.load(json_file)
    return json.dumps(sector_raw_json)

if __name__ == '__main__':
    app.run()