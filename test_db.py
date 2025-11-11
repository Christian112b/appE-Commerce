import os
import socket
from dotenv import load_dotenv
import mysql.connector

load_dotenv()

def test_network_connectivity(host, port):
    """Test basic network connectivity to the host and port"""
    try:
        print(f"Testing network connectivity to {host}:{port}...")
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        result = sock.connect_ex((host, port))
        sock.close()

        if result == 0:
            print("✓ Network connectivity: OK")
            return True
        else:
            print(f"✗ Network connectivity: FAILED (connection refused/error code: {result})")
            return False
    except Exception as e:
        print(f"✗ Network connectivity: FAILED ({e})")
        return False

def test_connection():
    host = os.getenv('DB_HOST')
    port = int(os.getenv('DB_PORT')) if os.getenv('DB_PORT') else 3306
    user = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')
    database = os.getenv('DB_NAME')

    print("=== Database Connection Test ===")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"User: {user}")
    print(f"Database: {database}")
    print(f"Password: {'*' * len(password) if password else 'None'}")
    print()

    # Test 1: Network connectivity
    if not test_network_connectivity(host, port):
        print("\n❌ DIAGNOSIS: Cannot reach the database server. Possible causes:")
        print("   - Database is sleeping/paused (common with Zeabur)")
        print("   - Firewall blocking the connection")
        print("   - Wrong host/port")
        print("   - Network connectivity issues")
        return

    # Test 2: SSL connection
    print("\nTesting SSL connection...")
    try:
        conn = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            ssl_ca=None,
            ssl_cert=None,
            ssl_key=None,
            ssl_verify_cert=False,
            connect_timeout=10
        )
        print("✓ SSL connection: SUCCESS")

        # Test a simple query
        cursor = conn.cursor()
        cursor.execute("SELECT 1 as test")
        result = cursor.fetchone()
        print(f"✓ Query test: SUCCESS (result: {result})")

        conn.close()

    except mysql.connector.errors.ProgrammingError as e:
        print(f"✗ SSL connection failed - Programming Error: {e}")
        print("   This usually means wrong credentials or database name")
    except mysql.connector.errors.DatabaseError as e:
        print(f"✗ SSL connection failed - Database Error: {e}")
        print("   This usually means database server error")
    except mysql.connector.errors.InterfaceError as e:
        print(f"✗ SSL connection failed - Interface Error: {e}")
        print("   This usually means SSL/network issues")
    except Exception as e:
        print(f"✗ SSL connection failed - Unexpected Error: {e}")

        # Test 3: Non-SSL connection
        print("\nTesting non-SSL connection...")
        try:
            conn = mysql.connector.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                database=database,
                ssl_disabled=True,
                connect_timeout=10
            )
            print("✓ Non-SSL connection: SUCCESS")

            # Test a simple query
            cursor = conn.cursor()
            cursor.execute("SELECT 1 as test")
            result = cursor.fetchone()
            print(f"✓ Query test: SUCCESS (result: {result})")

            conn.close()

        except mysql.connector.errors.ProgrammingError as e:
            print(f"✗ Non-SSL connection failed - Programming Error: {e}")
            print("❌ DIAGNOSIS: Wrong credentials or database doesn't exist")
        except mysql.connector.errors.DatabaseError as e:
            print(f"✗ Non-SSL connection failed - Database Error: {e}")
            print("❌ DIAGNOSIS: Database server error or database not accessible")
        except mysql.connector.errors.InterfaceError as e:
            print(f"✗ Non-SSL connection failed - Interface Error: {e}")
            print("❌ DIAGNOSIS: Network connectivity issues")
        except Exception as e:
            print(f"✗ Non-SSL connection failed - Unexpected Error: {e}")
            print("❌ DIAGNOSIS: Unknown error - check all connection parameters")

if __name__ == "__main__":
    test_connection()