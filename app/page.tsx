import Link from 'next/link'

const CATEGORIES = [
  { key: 'webnovel', label: '网络小说', desc: '起点、晋江、番茄……', color: '#f0b860' },
  { key: 'lightnovel', label: '轻小说', desc: '日系、国产轻小说', color: '#c084fc' },
  { key: 'literature', label: '文学', desc: '经典与当代文学作品', color: '#6ee7a0' },
  { key: 'manga', label: '漫画', desc: '日漫、国漫、欧美漫画', color: '#7dd3fc' },
]

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4">

      {/* Hero */}
      <section className="pt-20 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="grid-bg absolute inset-0" />
          <div style={{ position: 'absolute', top: -100, right: -100, width: 600, height: 600, background: 'radial-gradient(circle, rgba(192,132,252,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 400, height: 400, background: 'radial-gradient(circle, rgba(240,184,96,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
        </div>

        <div className="max-w-2xl relative">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)', borderRadius: 99, padding: '4px 14px', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, background: '#c084fc', borderRadius: '50%', display: 'block', boxShadow: '0 0 6px #c084fc' }} />
            <span style={{ fontSize: 11, color: '#c084fc', fontFamily: 'Noto Sans SC', letterSpacing: '0.1em' }}>積ん読 · TSUNDOKU</span>
          </div>

          <h1 style={{ fontFamily: 'Noto Serif SC', fontSize: 52, fontWeight: 300, lineHeight: 1.15, color: '#e8e0f0', marginBottom: 20 }}>
            每一本书<br />
            <span style={{ color: '#c084fc' }}>都值得被记录</span>
          </h1>
          <p style={{ fontFamily: 'Noto Sans SC', fontSize: 15, color: '#8a82a0', lineHeight: 1.8, maxWidth: 480, marginBottom: 32 }}>
            追踪你的网文进度、轻小说书架、文学收藏。社区评分、短评、标签，打造属于书迷的 Bangumi。
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/search" className="btn-primary" style={{ fontSize: 14 }}>开始搜书</Link>
            <Link href="/browse" className="btn-ghost" style={{ fontSize: 14 }}>按分类浏览 →</Link>
          </div>
        </div>
      </section>

      {/* Category cards */}
      <section style={{ marginBottom: 64 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Noto Serif SC', fontSize: 20, color: '#e8e0f0' }}>按分类浏览</h2>
          <Link href="/browse" style={{ fontSize: 13, color: '#c084fc', fontFamily: 'Noto Sans SC' }}>全部分类 →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {CATEGORIES.map(cat => (
            <Link key={cat.key} href={`/browse?category=${cat.key}`}
              style={{ background: '#13131a', border: '1px solid #252535', borderRadius: 8, padding: '20px 18px', display: 'block', transition: 'border-color 0.2s, transform 0.2s', textDecoration: 'none' }}
              className="hover:border-accent group">
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cat.color}18`, border: `1px solid ${cat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: cat.color }}>
                  {cat.key === 'webnovel' ? '文' : cat.key === 'lightnovel' ? 'ラ' : cat.key === 'literature' ? '典' : '漫'}
                </span>
              </div>
              <p style={{ fontFamily: 'Noto Sans SC', fontSize: 14, fontWeight: 500, color: '#e8e0f0', marginBottom: 4 }}>{cat.label}</p>
              <p style={{ fontFamily: 'Noto Sans SC', fontSize: 12, color: '#8a82a0' }}>{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* AI feature */}
      <section style={{ marginBottom: 64 }}>
        <div style={{ background: '#13131a', border: '1px solid #252535', borderRadius: 12, padding: '40px 48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(192,132,252,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)', borderRadius: 99, padding: '3px 12px', marginBottom: 16 }}>
              <span style={{ fontSize: 10, color: '#c084fc', fontFamily: 'Noto Sans SC', letterSpacing: '0.1em' }}>✦ AI 推荐</span>
            </div>
            <h3 style={{ fontFamily: 'Noto Serif SC', fontSize: 26, color: '#e8e0f0', marginBottom: 10 }}>不知道读什么？</h3>
            <p style={{ fontFamily: 'Noto Sans SC', fontSize: 14, color: '#8a82a0', lineHeight: 1.8, maxWidth: 420, marginBottom: 24 }}>
              把你的书架交给 AI，它会根据你的品味推荐下一本——不是算法，是真正的鉴赏力。
            </p>
            <Link href="/shelf" className="btn-primary" style={{ fontSize: 14 }}>去我的书架</Link>
          </div>
        </div>
      </section>

    </div>
  )
}
