from redis.asyncio import ConnectionPool, Redis

from app.config import settings

pool = ConnectionPool.from_url(settings.redis_url, decode_responses=True)
redis_client = Redis.from_pool(pool)


async def get_redis() -> Redis:
    return redis_client


async def close_redis():
    await redis_client.aclose()
