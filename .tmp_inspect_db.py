import sqlite3, sys

def inspect_db(path):
    print(f"\n=== {path.split('/')[-1]} ===")
    try:
        conn = sqlite3.connect(path)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cur.fetchall()
        print(f'Tables: {[t[0] for t in tables]}')
        for t in tables:
            tname = t[0]
            cur.execute(f'SELECT COUNT(*) FROM "{tname}"')
            cnt = cur.fetchone()[0]
            cur.execute(f'PRAGMA table_info("{tname}")')
            cols = cur.fetchall()
            col_names = [c[1] for c in cols]
            print(f'  {tname}: {cnt} rows, columns={col_names}')
            # 查找包含 folder/directory/name 等字段的表，重点看
            if cnt > 0:
                # 打印前几条
                cur.execute(f'SELECT * FROM "{tname}" LIMIT 10')
                rows = cur.fetchall()
                for r in rows:
                    print(f'    {r}')
            print()
        conn.close()
    except Exception as e:
        print(f'Error: {e}')

if __name__ == '__main__':
    for db in sys.argv[1:]:
        inspect_db(db)
