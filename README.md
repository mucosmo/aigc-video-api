# aigc-video-api

## linux 软件需求

1. redis 5.0+ (redis-cli -v)

## 更新后重启

```bash
# 如有必要，更新服务参数
vi .env
# 运行
./run.sh
# 用 pm2 可以看到 aigc-video-api 在运行
pm2 list
```

## 初次运行

```bash
# 拉取代码安装依赖
git pull
cnpm install

# 生成 env 文件，然后配置参数
mv .env.example .env

# 运行
npm start

# 用 pm2 可以看到 aigc-video-api 在运行
pm2 list
```
