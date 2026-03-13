# Metainfo

* Title: Git版本控制完全手册
* Author: WY
* Data: 2025-03-13 周四
* Tags:
  * #读书笔记
  * #学习笔记
  * #Git
  * #版本控制

---

# Git版本控制完全手册

本文档整理了Git分布式版本控制系统的完整知识体系，涵盖基础概念、常用命令、分支管理、远程仓库操作及IDEA集成使用。

---

# 一、Git概述

## 1. 版本控制的重要性

### 开发中的实际场景

**场景一：备份**
小明负责的模块就要完成了，就在即将Release之前的一瞬间，电脑突然蓝屏，硬盘光荣牺牲！几个月来的努力付之东流。

**场景二：代码还原**
这个项目中需要一个很复杂的功能，老王摸索了一个星期终于有眉目了，可是这被改得面目全非的代码已经回不到从前了。

**场景三：协同开发**
小刚和小强先后从文件服务器上下载了同一个文件：Analysis.java。小刚在文件中的第30行声明了一个方法count()，先保存到了文件服务器上；小强在文件中的第50行声明了一个方法sum()，也随后保存到了文件服务器上，于是count()方法就只存在于小刚的记忆中了。

**场景四：追溯问题代码**
老王是项目经理，每次因为项目进度挨骂之后，他都不知道该扣哪个程序员的工资！有个Bug调试了30多个小时才知道是因为相关属性没有在应用初始化时赋值！可是二胖、王东、刘流和正经牛都不承认是自己干的！

---

## 2. 版本控制器的分类

### 集中式版本控制工具
版本库是集中存放在中央服务器的，team里每个人work时从中央服务器下载代码，必须联网才能工作，个人修改后然后提交到中央版本库。

**举例**：SVN和CVS

**缺点**：
- 需要联网
- 中央服务器磁盘损坏，项目会彻底崩溃

### 分布式版本控制工具
没有"中央服务器"，每个人的电脑上都是一个完整的版本库，这样工作的时候无需联网。多人协作只需要各自的修改推送给对方，就能互相看到对方的修改了。

**举例**：Git

**优点**：
- 不需要联网也能工作
- 每个开发人员的本地都有一个完整的版本库拷贝
- 不用担心共享版本库宕机的问题

---

## 3. Git简介

Git是一个开源的分布式版本控制系统，可以有效、高速地处理从很小到非常大的项目版本管理。Git是Linus Torvalds为了帮助管理Linux内核开发而开发的一个开放源码的版本控制软件。

### Git的特点
- 速度简单的设计
- 对非线性开发模式的强力支持（允许成千上万个并行开发的分支）
- 完全分布式
- 有能力高效管理类似Linux内核一样的超大规模项目

### 核心概念
Git是一个分布式版本管理系统，它通过共享版本库来共享版本信息，所以相当于每个开发人员的本地都有一个共享版本库的拷贝，所有人员的本地版本库和共享版本库都是同步的。

- **无需联网**：自己开发的时候不需要联网
- **版本共享**：实现版本共享时需要联网

---

## 4. Git工作流程

```
┌─────────────┐     clone      ┌─────────────┐
│  远程仓库    │◄──────────────│  本地仓库    │
└─────────────┘                └─────────────┘
      ▲                              │
      │ push                         │ checkout
      │                              ▼
      │                        ┌─────────────┐
      └───────────────────────►│   工作区    │
                               └─────────────┘
                                     │
                                     │ add
                                     ▼
                               ┌─────────────┐
                               │   暂存区    │
                               └─────────────┘
                                     │
                                     │ commit
                                     ▼
                               ┌─────────────┐
                               │  本地仓库    │
                               └─────────────┘
```

### 核心命令
1. **clone（克隆）**：从远程仓库中克隆代码到本地仓库
2. **checkout（检出）**：从本地仓库中检出一个仓库分支然后进行修订
3. **add（添加）**：在提交前先将代码提交到暂存区
4. **commit（提交）**：提交到本地仓库，本地仓库中保存修改的各个历史版本
5. **fetch（抓取）**：从远程库抓取到本地仓库，不进行任何合并动作
6. **pull（拉取）**：从远程库拉到本地库，自动进行合并，相当于fetch+merge
7. **push（推送）**：修改完成后，需要和团队成员共享代码时，将代码推送到远程仓库

---

# 二、Git安装与配置

## 1. 下载与安装

**下载地址**：https://git-scm.com/download

安装完成后在电脑桌面点击右键，如果能够看到如下两个菜单则说明Git安装成功：
- **Git GUI**：Git提供的图形界面工具
- **Git Bash**：Git提供的命令行工具

---

## 2. 基本配置

当安装Git后首先要做的事情是设置用户名称和email地址。这是非常重要的，因为每次Git提交都会使用该用户信息。

```bash
# 设置用户名
git config --global user.name "your_name"

# 设置邮箱
git config --global user.email "your_email@example.com"

# 查看配置信息
git config --global user.name
git config --global user.email
```

> **注意**：邮箱可以是假邮箱，Git通过邮箱辨识是哪个人。

---

## 3. 为常用指令配置别名（可选）

有些常用的指令参数非常多，每次都要输入好多参数，我们可以使用别名。

```bash
# 创建.bashrc文件
touch ~/.bashrc

# 在.bashrc文件中输入如下内容：
# 用于输出git提交日志
alias git-log='git log --pretty=oneline --all --graph --abbrev-commit'
# 用于输出当前目录所有文件及基本信息
alias ll='ls -al'

# 使配置生效
source ~/.bashrc
```

---

## 4. 解决GitBash乱码问题

```bash
# 打开GitBash执行下面命令
git config --global core.quotepath false

# 在${git_home}/etc/bash.bashrc文件最后加入下面两行
export LANG="zh_CN.UTF-8"
export LC_ALL="zh_CN.UTF-8"
```

---

# 三、Git基础操作

## 1. 获取本地仓库

要使用Git对代码进行版本控制，首先需要获得本地仓库：

1. 在电脑的任意位置创建一个空目录作为本地Git仓库
2. 进入这个目录中，点击右键打开Git bash窗口
3. 执行命令 `git init`
4. 如果创建成功后可在文件夹下看到隐藏的.git目录

---

## 2. Git文件状态

Git工作目录下对于文件的修改（增加、删除、更新）会存在几个状态：

| 状态 | 说明 |
|------|------|
| Untracked | 未跟踪（未被纳入版本控制） |
| Tracked | 已跟踪（被纳入版本控制） |
| Unmodified | 未修改状态 |
| Modified | 已修改状态 |
| Staged | 暂存状态 |

---

## 3. 常用命令

### 查看修改状态
```bash
git status
```
作用：查看的修改的状态（暂存区、工作区）

### 添加工作区到暂存区
```bash
# 添加单个文件
git add 文件名

# 添加所有修改
git add .
```

### 提交暂存区到本地仓库
```bash
git commit -m '注释内容'
```
**注意**：提交时候添加的备注会被放到日志中。

### 查看提交日志
```bash
# 完整格式
git log [option]

# 常用参数
--all            显示所有分支
--pretty=oneline 将提交信息显示为一行
--abbrev-commit  使得输出的commitId更简短
--graph          以图的形式显示

# 使用别名（推荐）
git-log
```

### 版本回退
```bash
git reset --hard commitID
```

**commitID**：可以使用git-log或git log指令查看。

**查看已经删除的记录**：
```bash
git reflog
```

> `git reset --hard commitID` 既可以做版本回退，也可以做版本还原。

---

## 4. 添加文件至忽略列表

一般我们总会有些文件无需纳入Git的管理，也不希望它们总出现在未跟踪文件列表。可以在工作目录中创建一个名为 `.gitignore` 的文件，列出要忽略的文件模式。

```gitignore
# 示例
*.a        # 忽略所有.a文件
*.log      # 忽略所有.log文件
node_modules/  # 忽略node_modules目录
```

---

# 四、分支管理

## 1. 分支概念

几乎所有的版本控制系统都以某种形式支持分支。使用分支意味着你可以把你的工作从开发主线上分离开来进行重大的Bug修改、开发新的功能，以免影响开发主线。

**核心要点**：
- 每个人开发的那一部分就是一个分支
- 工作区只能在一个分支工作
- 每个分支存放的文件或资源是不一样的

---

## 2. 分支操作命令

### 查看本地分支
```bash
git branch
```
`*`号表示所在的分支。

### 创建本地分支
```bash
git branch 分支名
```
创建的新分支会建立在当前分支的版本之上。

### 切换分支
```bash
# 切换到已存在的分支
git checkout 分支名

# 创建并切换到新分支
git checkout -b 分支名
```

### 合并分支
```bash
git merge 分支名称
```

**步骤**：
1. 切换到master分支
2. 执行合并命令
3. 分支上的资源、文件就会被合并到主线上

### 删除分支
```bash
# 删除分支（需要做各种检查）
git branch -d 分支名

# 强制删除（不做任何检查）
git branch -D 分支名
```
**注意**：不能删除当前分支，只能删除其他分支。

---

## 3. 解决冲突

当两个或多个分支对同一个文件的同一个地方进行修改时，Git就不知道要取哪个分支修改的值，此时就产生了冲突。

### 冲突的表现
```
<<<<<<< HEAD
当前分支的内容
=======
要合并分支的内容
>>>>>>> 分支名
```

### 解决冲突步骤
1. 处理文件中冲突的地方（手动选择保留哪个内容）
2. 将解决完冲突的文件加入暂存区 `git add`
3. 提交到仓库 `git commit`

---

## 4. 分支使用原则与流程

### 分支类型

| 分支类型 | 说明 | 是否可删 |
|----------|------|----------|
| master（生产）分支 | 线上分支，主分支 | 否 |
| develop（开发）分支 | 开发部门的主要开发分支 | 否 |
| feature/xxxx分支 | 同期并行开发，不同期上线 | 用完可删 |
| hotfix/xxxx分支 | 线上bug修复使用 | 用完可删 |
| test分支 | 用于代码测试 | 可删 |
| pre分支 | 预上线分支 | 可删 |

### 开发流程
1. 从master创建develop分支
2. 从develop创建feature分支进行新功能开发
3. 功能开发完成后合并到develop分支
4. 项目完成后develop合并到master分支

---

# 五、远程仓库操作

## 1. 常用托管服务

| 平台 | 地址 | 特点 |
|------|------|------|
| GitHub | https://github.com | 面向开源及私有软件项目的托管平台 |
| 码云(Gitee) | https://gitee.com | 国内代码托管平台，速度更快 |
| GitLab | https://about.gitlab.com | 开源项目，可用于企业内部搭建git私服 |

---

## 2. 配置SSH公钥

```bash
# 生成SSH公钥
ssh-keygen -t rsa

# 不断回车（如果公钥已经存在，则自动覆盖）

# 获取公钥
cat ~/.ssh/id_rsa.pub

# 验证是否配置成功
ssh -T git@gitee.com
```

---

## 3. 操作远程仓库

### 添加远程仓库
```bash
git remote add <远端名称> <仓库路径SSH>
```
远端名称默认是origin。

### 查看远程仓库
```bash
git remote
```

### 推送到远程仓库
```bash
# 基本推送
git push origin master

# 推送并建立关联
git push --set-upstream origin master

# 强制覆盖
git push -f origin master

# 当前分支已关联，可省略分支名和远端名
git push
```

### 查看本地分支与远程分支的关联关系
```bash
git branch -vv
```

### 从远程仓库克隆
```bash
git clone <仓库路径> [本地目录]
```
本地目录可以省略，会自动生成一个目录。

### 从远程仓库抓取和拉取
```bash
# 抓取（不会合并）
git fetch [remote name] [branch name]

# 拉取（自动合并）
git pull [remote name] [branch name]
```

**区别**：
- `fetch`：将仓库里的更新都抓取到本地，不会进行合并
- `pull`：将远端仓库的修改拉到本地并自动进行合并，相当于fetch+merge

---

## 4. 解决合并冲突

当A、B用户修改了同一个文件，且修改了同一行位置的代码时，会发生合并冲突。

**解决流程**：
1. A用户优先推送到远程仓库
2. B用户需要先拉取远程仓库的提交
3. 解决冲突
4. 再推送到远端分支

**核心原则**：
- push时要确保远程仓库的更新是最新的
- pull时要确保本地仓库的更新是最新的

---

# 六、在IDEA中使用Git

## 1. 配置Git

选择File → Settings打开设置窗口，找到Version Control下的git选项，点击Test按钮验证配置成功。

---

## 2. 文件状态颜色

| 颜色 | 说明 |
|------|------|
| 绿色 | 已添加到git中 |
| 红色 | 未被添加到git中，被识别为冲突文件 |
| 灰色 | 已忽略的文件 |

---

## 3. 常用操作入口

### 初始化本地仓库
VCS → Import into Version Control → Create Git Repository

### 设置远程仓库
Git → Manage Remotes

### 提交到本地仓库
Git → Commit（或使用快捷键 Ctrl+K）

### 推送到远程仓库
Git → Push（或使用快捷键 Ctrl+Shift+K）

### 克隆远程仓库
File → New → Project from Version Control

### 创建分支
Git → New Branch

### 切换分支
Git → Branches → 选择分支 → Checkout

### 合并分支
Git → Branches → 选择要合并的分支 → Merge

---

## 4. 解决冲突

1. 执行merge或pull操作时，可能发生冲突
2. 解决文件里的冲突，删除提示信息
3. 冲突解决后加入暂存区
4. 提交到本地仓库
5. 推送到远程仓库

---

# 七、Git使用铁律

1. **切换分支前先提交本地的修改**
2. **代码及时提交，提交过了就不会丢**
3. **遇到任何问题都不要删除文件目录**

---

# 八、常用命令速查表

## 配置相关
```bash
git config --global user.name "name"    # 设置用户名
git config --global user.email "email"  # 设置邮箱
git config --list                       # 查看配置信息
```

## 本地操作
```bash
git init              # 初始化仓库
git status            # 查看状态
git add .             # 添加所有文件到暂存区
git commit -m "msg"   # 提交到本地仓库
git log               # 查看日志
git reflog            # 查看所有操作记录
git reset --hard ID   # 版本回退/还原
```

## 分支操作
```bash
git branch            # 查看分支
git branch name       # 创建分支
git checkout name     # 切换分支
git checkout -b name  # 创建并切换分支
git merge name        # 合并分支
git branch -d name    # 删除分支
```

## 远程操作
```bash
git remote add origin URL   # 添加远程仓库
git remote -v               # 查看远程仓库
git push origin master      # 推送到远程
git pull origin master      # 拉取并合并
git fetch origin            # 抓取（不合并）
git clone URL               # 克隆仓库
```

---

# 九、疑难问题解决

## Windows下看不到隐藏的文件
在文件夹选项中勾选"显示隐藏的文件、文件夹和驱动器"。

## Windows下无法创建.ignore或.bashrc文件
在git目录下打开gitbash，执行指令：
```bash
touch .gitignore
```

---

# 附录：参考资源

- Git官方下载：https://git-scm.com/download/win
- VSCode官方下载：https://code.visualstudio.com/download
- Gitee官网：https://gitee.com/
- GitHub：https://github.com

---

*本文档整理自Git学习笔记，涵盖从入门到实战的完整知识体系*