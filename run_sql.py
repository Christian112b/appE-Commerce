import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

def run_sql_file(filename):
    """Execute SQL commands from a file"""
    host = os.getenv('DB_HOST')
    port = int(os.getenv('DB_PORT')) if os.getenv('DB_PORT') else 3306
    user = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')
    database = os.getenv('DB_NAME')

    try:
        # Connect to database
        conn = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            ssl_disabled=True,
            connect_timeout=10
        )

        cursor = conn.cursor()

        # Read SQL file
        with open(filename, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # Split into individual statements
        statements = sql_content.split(';')

        for statement in statements:
            statement = statement.strip()
            if statement:
                print(f"Executing: {statement[:50]}...")
                cursor.execute(statement)
                print("✓ Success")

        conn.commit()
        print(f"\n✅ All SQL statements in {filename} executed successfully!")

    except Exception as e:
        print(f"❌ Error executing SQL: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    if len(os.sys.argv) > 1:
        sql_file = os.sys.argv[1]
    else:
        sql_file = 'create_orders_tables.sql'

    if os.path.exists(sql_file):
        run_sql_file(sql_file)
    else:
        print(f"❌ SQL file '{sql_file}' not found")