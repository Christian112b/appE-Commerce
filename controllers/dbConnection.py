import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

class DBConnection:
    def __init__(self):
        # Get environment variables with defaults
        host = os.getenv('DB_HOST', 'localhost')
        port = int(os.getenv('DB_PORT', 3306))  # Default MySQL port
        user = os.getenv('DB_USER', 'root')
        password = os.getenv('DB_PASSWORD', '')
        database = os.getenv('DB_NAME', 'costanzo')
        
        self.conn = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database
        )
        self.cursor = self.conn.cursor(dictionary=True)

    def query(self, sql, params=None):
        self.cursor.execute(sql, params or ())
        return self.cursor.fetchall()

    def execute(self, sql, params=None):
        self.cursor.execute(sql, params or ())
        self.conn.commit()

    def close(self):
        self.cursor.close()
        self.conn.close()
