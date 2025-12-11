# 🏭 产品目录自动化平台

> 工业连接器产品目录自动生成系统 - 告别手动排版！

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/product-catalog-generator&env=DATABASE_URL,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=product-catalog&repository-name=product-catalog-generator)

## ✨ 功能特点

- 📝 **动态表单** - 不同产品系列自动生成对应的编辑表单
- 📄 **自动排版** - 一键生成专业的PDF产品页
- 👥 **多人协作** - 每个同事有独立账号，可追踪修改历史
- 📊 **审计日志** - 记录每次修改，方便校对

## 🚀 快速部署指南

### 第1步：创建 Supabase 项目

1. 登录 [Supabase](https://supabase.com)
2. 点击 "New Project"
3. 填写项目名称，设置数据库密码（请记住这个密码！）
4. 选择区域：Singapore（离中国最近）
5. 点击 "Create new project"，等待 2 分钟

### 第2步：获取 Supabase 密钥

1. 在 Supabase 项目页面，点击左侧 ⚙️ "Settings"
2. 点击 "API"
3. 记录以下信息：
   - **Project URL** (类似 `https://xxxxx.supabase.co`)
   - **anon public** 密钥

### 第3步：部署到 Vercel

1. 点击上方的 "Deploy with Vercel" 按钮
2. 登录您的 Vercel 账号
3. 填写环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL` = 您的 Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 您的 anon public 密钥
   - `DATABASE_URL` = 在 Supabase Settings > Database 中找到
4. 点击 "Deploy"
5. 等待 2-3 分钟，部署完成！

### 第4步：初始化数据库

部署完成后，访问：`https://您的域名.vercel.app/api/setup`

这会自动创建所需的数据库表。

## 📖 使用说明

### 管理员操作

1. 访问 `/admin` 进入管理后台
2. 在 "系列管理" 中配置产品系列的字段结构
3. 在 "产品管理" 中添加/编辑产品

### 生成 PDF

1. 选择要生成的产品
2. 点击 "预览 PDF"
3. 确认无误后点击 "下载 PDF"

## 🛠️ 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **数据库**: PostgreSQL (Supabase)
- **PDF生成**: @react-pdf/renderer
- **部署**: Vercel

## 📞 遇到问题？

如果部署过程中遇到任何问题，请：
1. 检查环境变量是否正确填写
2. 确保 Supabase 项目已创建完成
3. 查看 Vercel 部署日志中的错误信息

---

Made with ❤️ for Industrial Connector Teams

