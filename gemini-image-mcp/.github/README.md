# GitHub Actions 自动发布

## 配置步骤

### 1. 添加 npm Token

在 GitHub 仓库设置中添加 Secret：

```
Settings → Secrets and variables → Actions → New repository secret
```

- **Name**: `NPM_TOKEN`
- **Value**: 你的 npm token

获取 token:
```bash
npm login
npm token create
```

### 2. 发布新版本

```bash
# 更新版本
npm version patch   # 1.1.0 → 1.1.1
npm version minor   # 1.1.0 → 1.2.0
npm version major   # 1.1.0 → 2.0.0

# 推送到 main 分支
git push origin main
```

✅ **自动完成**:
- 构建项目
- 发布到 npm
- 创建 git tag

## 工作流说明

**触发条件**:
- Push 到 main 分支
- package.json、src/** 或 tsconfig.json 文件变更
- 或手动触发

**智能发布**:
- 自动检测版本是否已发布
- 如果版本已存在，跳过发布
- 避免重复发布错误

## 手动触发

在 GitHub Actions 页面：
1. 选择 "Publish Package to npm"
2. 点击 "Run workflow"
3. 选择分支并运行
