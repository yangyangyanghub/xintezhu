#!/usr/bin/env python3
import paramiko

password = "Ap!$RBw4QYv?4WN"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('121.196.173.46', username='root', password=password)

print("===== Host 是否有 sqlite3 =====")
stdin, stdout, stderr = ssh.exec_command('which sqlite3 2>/dev/null; sqlite3 --version')
print(stdout.read().decode('utf-8'))
print(stderr.read().decode('utf-8'))

# 安装 sqlite3
print("\n===== 安装 sqlite3 =====")
stdin, stdout, stderr = ssh.exec_command('apt-get update && apt-get install -y sqlite3')
output = stdout.read().decode('utf-8')
error = stderr.read().decode('utf-8')
print("安装输出:", output[-200:] if len(output) > 200 else output)
if error:
    print("错误:", error[:500])

ssh.close()
