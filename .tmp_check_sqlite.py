#!/usr/bin/env python3
import paramiko

password = "Ap!$RBw4QYv?4WN"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('121.196.173.46', username='root', password=password)

# 查看容器里有哪些可执行文件
print("===== 容器内可用命令 =====")
stdin, stdout, stderr = ssh.exec_command('docker exec 1Panel-new-api-SNkc ls -la /bin /usr/bin /go/bin 2>/dev/null | head -50')
print(stdout.read().decode('utf-8'))

# 检查容器内的二进制文件
print("\n===== 尝试 which 命令 =====")
stdin, stdout, stderr = ssh.exec_command('docker exec 1Panel-new-api-SNkc which python3 python sqlite3 go 2>/dev/null')
print(stdout.read().decode('utf-8'))

# 检查 new-api 镜像信息
print("\n===== 容器镜像信息 =====")
stdin, stdout, stderr = ssh.exec_command('docker inspect 1Panel-new-api-SNkc --format "{{.Config.Image}}"')
print(stdout.read().decode('utf-8'))

# 查找数据库文件
print("\n===== 查找 .db 文件 =====")
stdin, stdout, stderr = ssh.exec_command('find /opt/1panel/apps/new-api -name "*.db" -o -name "*.sqlite" 2>/dev/null')
print(stdout.read().decode('utf-8'))

ssh.close()
