---
title: "打包方案决策：Windows/macOS/Linux"
created: 2026-04-19
updated: 2026-04-19
sources: ["../调研笔记/OpenSource-Packaging-Solution/OpenSource-Packaging-Solution调研报告.md", "../调研笔记/Installer-Packaging/Installer-Packaging调研报告.md", "../调研笔记/macOS_DMG打包方案调研_完整版.md", "../调研笔记/Linux开源项目打包方案调研.md", "../调研笔记/2026-04-01-Windows打包工具调研.md", "../调研笔记/cmux-Windows-alternatives/cmux-Windows-alternatives调研报告.md"]
tags: [打包部署, 跨平台, Windows, macOS, Linux, 选型决策]
status: active
---

# 打包方案决策：Windows/macOS/Linux

> 开源项目跨平台打包方案的全景对比，覆盖三大操作系统的核心工具和推荐组合。

---

## 一句话决策

**核心方案**：Go 项目用单二进制打包 + Docker，桌面应用用 Electron-builder / Tauri，平台特定需求再用原生工具补充（WiX/NSIS/DMG/deb/rpm）。

---

## Windows 方案对比

| 工具 | 格式 | 适用场景 | 复杂度 | 备注 |
|------|------|---------|--------|------|
| **单二进制（Go）** | .exe | Go/CLI 项目 | ⭐ 最低 | Go 原生优势，零部署依赖 |
| **NSIS** | .exe | 通用桌面应用 | ⭐⭐ 中 | 高度定制化脚本，社区活跃 |
| **Inno Setup** | .exe | 简单易用桌面 | ⭐ 低 | 快速上手，v7.x 活跃 |
| **WiX Toolset** | .msi | 企业级安装 | ⭐⭐⭐ 高 | 微软官方支持，XML 配置 |
| **Electron-builder** | .exe/.msi | Electron 应用 | ⭐⭐ 中 | Node.js 集成 |

## macOS 方案对比

| 工具 | 格式 | 适用场景 | 复杂度 | 备注 |
|------|------|---------|--------|------|
| **单二进制（Go）** | Unix exec | Go/CLI 项目 | ⭐ 最低 | Go 原生交叉编译 |
| **DMG 打包** | .dmg | 桌面应用分发 | ⭐⭐ 中 | 传统 macOS 分发格式 |
| **appdmg** | .dmg | Node.js 生态 | ⭐ 低 | 命令行工具 |
| **Electron-builder** | .app/.dmg | Electron 应用 | ⭐⭐ 中 | 跨平台一致 |
| **Tauri** | .app | Rust 生态 | ⭐⭐ 中 | 比 Electron 更轻量 |

## Linux 方案对比

| 工具 | 格式 | 适用场景 | 复杂度 | 备注 |
|------|------|---------|--------|------|
| **单二进制（Go）** | Linux exec | Go/CLI | ⭐ 最低 | Go 交叉编译 |
| **Docker** | Container | 服务端应用 | ⭐⭐ 中 | 推荐部署方式 |
| **deb/rpm** | .deb/.rpm | 系统级安装 | ⭐⭐ 中 | 包管理器友好 |
| **Electron-builder** | AppImage/deb/rpm | Electron 应用 | ⭐⭐ 中 | 跨平台 |
| **Tauri** | AppImage | Rust 生态 | ⭐⭐ 中 | 轻量原生 |

---

## 推荐组合策略

| 项目类型 | Windows | macOS | Linux |
|---------|---------|-------|-------|
| **Go CLI 工具** | .exe 单二进制 | Unix exec | Linux exec |
| **桌面 GUI 应用** | NSIS / Inno | DMG | AppImage |
| **Web/服务端** | Docker | Docker | Docker |
| **Electron 应用** | electron-builder | electron-builder | electron-builder |
| **Tauri 应用** | Tauri | Tauri | Tauri |

---

## 关键考量

| 维度 | 建议 |
|------|------|
| 开源合规 | 选择 MIT/Apache 许可的打包工具 |
| CI/CD 集成 | GitHub Actions + electron-builder/goreleaser 一键跨平台构建 |
| 自动化签名 | macOS 必需（Apple Notarization），Windows 可选（EV 证书） |
| 更新机制 | electron-updater（Electron）、Go 自建更新服务 |
| 体积控制 | Tauri << Electron（Tauri 仅几 MB vs Electron 100+ MB） |

---

## 相关页面
- [[LLM-Gateway-选型-New-API-vs-LiteLLM|LLM Gateway 选型：New-API vs LiteLLM]] — Go 单二进制部署优势
- Agent 部署方案 — Synthesis 待扩充（Docker + 容器化部署）

## 来源
- [[myk/调研笔记/OpenSource-Packaging-Solution/OpenSource-Packaging-Solution调研报告|开源项目打包方案调研报告]]
- [[myk/调研笔记/Installer-Packaging/Installer-Packaging调研报告|安装器打包方案调研报告]]
- [[myk/调研笔记/2026-04-01-Windows打包工具调研|Windows 打包工具调研]]
