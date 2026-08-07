# 电竞考核匹配平台 - 部署指南

## 当前状态

| 模式 | 说明 | 多设备同步 |
|------|------|-----------|
| 本地后端 (localhost:3000) | Express + JSON数据库，已运行 | 支持 |
| 云端静态部署 | CloudStudio，前端+localStorage降级 | 不支持 |
| 云端全栈部署 | 需要部署到Node.js云平台 | 支持 |

## 如何实现多设备同步（生产部署）

### 方案 A：Render.com（推荐，免费）

1. **注册 GitHub 账号**（如已有跳过）
   - 访问 https://github.com 注册

2. **上传代码到 GitHub**
   - 创建新仓库，上传以下文件：
     - `server.js`
     - `package.json`
     - `index.html`
     - `Procfile`

3. **注册 Render 账号**
   - 访问 https://render.com
   - 用 GitHub 账号登录

4. **创建 Web Service**
   - 点击 New → Web Service
   - 选择你的 GitHub 仓库
   - 配置：
     - Name: `esport-assessment`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `node server.js`
   - 点击 Create Web Service

5. **等待部署完成**
   - Render 会自动安装依赖并启动服务
   - 部署成功后会得到一个公网URL，如：`https://esport-assessment.onrender.com`
   - 这个URL就是考生和考官访问的地址

### 方案 B：本地运行（临时使用）

如果暂时不需要公网访问，可以在本机运行：

```bash
# 进入项目目录
cd C:\Users\caoshuai\WorkBuddy\2026-08-07-18-34-46

# 启动服务器
node server.js

# 访问 http://localhost:3000
```

同一局域网内的设备可通过 `http://你的内网IP:3000` 访问。

### 方案 C：Railway.app（免费试用）

1. 访问 https://railway.app
2. 用 GitHub 登录
3. New Project → Deploy from GitHub repo
4. 选择仓库，自动检测 Node.js 项目
5. 部署完成后获取公网URL

## 后端 API 接口文档

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/bookings` | 获取所有预约 |
| GET | `/api/bookings/:id` | 获取单个预约 |
| POST | `/api/bookings` | 创建预约 |
| PATCH | `/api/bookings/:id/accept` | 考官接单 |
| PATCH | `/api/bookings/:id/start` | 开始考核 |
| PATCH | `/api/bookings/:id/complete` | 完成考核（提交评分） |
| PATCH | `/api/bookings/:id/cancel` | 取消预约 |
| DELETE | `/api/bookings` | 清空所有预约（管理用） |

## 前端双模式说明

前端会自动检测后端是否可用：
- **检测到后端** → 显示绿色"多设备同步"标识，数据通过API共享
- **未检测到后端** → 显示黄色"单设备模式"标识，数据保存在浏览器本地

## 后续迭代建议

1. **登录认证** - 添加用户注册/登录（手机号或微信）
2. **考官资质审核** - 管理员审核考官身份
3. **消息通知** - 新单提醒（微信模板消息/短信）
4. **管理后台** - 数据统计、导出、争议处理
5. **数据库升级** - 从JSON文件迁移到PostgreSQL/MySQL
