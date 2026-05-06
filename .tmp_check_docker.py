#!/usr/bin/env python3
import paramiko

password = "Ap!$RBw4QYv?4WN"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('121.196.173.46', username='root', password=password)

# 查看 new-api 容器环境变量
print("===== new-api 容器环境变量 =====")
stdin, stdout, stderr = ssh.exec_command('docker inspect 1Panel-new-api-SNkc --format "{{json .Config.Env}}"')
env_raw = stdout.read().decode('utf-8')
print(env_raw)

# 检查是否用 SQLite
print("\n===== 是否使用 SQLite? =====")
stdin, stdout, stderr = ssh.exec_command('docker inspect 1Panel-new-api-SNkc --format "{{json .Config.Env}}" | grep -i sqlite')
sqlite_check = stdout.read().decode('utf-8')
print(f"SQLite: {sqlite_check if sqlite_check else '未配置'}")

# 看挂载卷
print("\n===== new-api 挂载卷 =====")
stdin, stdout, stderr = ssh.exec_command('docker inspect 1Panel-new-api-SNkc --format "{{json .Mounts}}"')
print(stdout.read().decode('utf-8'))

# MySQL root 密码
print("\n===== MySQL 环境变量 =====")
stdin, stdout, stderr = ssh.exec_command('docker inspect mysql-server --format "{{json .Config.Env}}"')
print(stdout.read().decode('utf-8'))

ssh.close()
print("\n完成!")
